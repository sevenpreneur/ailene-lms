import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import dayjs from "dayjs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);

// Compile the actual source without importing Next's server-only environment.
function loadSource(filename, mocks = {}) {
  const source = readFileSync(path.resolve(filename), "utf8");
  const code = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const compiledModule = { exports: {} };
  const imports = (id) => {
    if (Object.hasOwn(mocks, id)) return mocks[id];
    if (id === "server-only") return {};
    if (id === "@/lib/log-error")
      return { __esModule: true, default: async () => {} };
    return require(id);
  };
  vm.runInNewContext(
    code,
    {
      module: compiledModule,
      exports: compiledModule.exports,
      require: imports,
      URL,
      console,
      process,
    },
    { filename },
  );
  return compiledModule.exports;
}

function storage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

test("login recovery keeps task destinations and rejects external/control-character destinations", () => {
  const { safeRedirect } = loadSource("src/lib/safe-redirect.ts");
  assert.equal(
    safeRedirect("/program/student/skill-practice?tab=library&page=2"),
    "/program/student/skill-practice?tab=library&page=2",
  );
  for (const value of [
    null,
    "https://outside.test",
    "//outside.test",
    "/\\outside.test",
    "/\t/outside.test",
    "/auth/login?redirectTo=/auth/login",
    "/api/auth/reset",
    "/\r\n/evil",
  ]) {
    assert.equal(safeRedirect(value), "/");
  }
});

test("drafts are separated by account, program and form version", () => {
  const { browserDraftKey, readBrowserDraft, writeBrowserDraft } = loadSource(
    "src/lib/browser-draft.ts",
  );
  const local = storage();
  const key = browserDraftKey("account-a", "program-a", "test:1:v1");
  writeBrowserDraft(local, key, {
    answer: "A",
    proof: "https://example.test/proof.pdf",
  });
  assert.equal(readBrowserDraft(local, key).answer, "A");
  assert.equal(
    readBrowserDraft(
      local,
      browserDraftKey("account-b", "program-a", "test:1:v1"),
    ),
    null,
  );
  assert.equal(
    readBrowserDraft(
      local,
      browserDraftKey("account-a", "program-b", "test:1:v1"),
    ),
    null,
  );
  assert.equal(
    readBrowserDraft(
      local,
      browserDraftKey("account-a", "program-a", "test:1:v2"),
    ),
    null,
  );
  writeBrowserDraft(local, key, null);
  assert.equal(readBrowserDraft(local, key), null);
});

test("expired and malformed drafts are discarded; storage errors stay observable", () => {
  const { readBrowserDraft, writeBrowserDraft } = loadSource(
    "src/lib/browser-draft.ts",
  );
  const local = storage();
  local.setItem(
    "old",
    JSON.stringify({
      savedAt: dayjs().subtract(31, "day").toISOString(),
      value: { answer: "A" },
    }),
  );
  local.setItem("broken", "{unfinished");
  assert.equal(readBrowserDraft(local, "old"), null);
  assert.equal(local.getItem("old"), null);
  assert.equal(readBrowserDraft(local, "broken"), null);
  assert.throws(
    () =>
      writeBrowserDraft(
        {
          setItem() {
            throw new Error("storage full");
          },
        },
        "new",
        { answer: "A" },
      ),
    /storage full/,
  );
});

const readMocks = (response) => ({
  "next/headers": {
    cookies: async () => ({ get: () => ({ value: "test-session" }) }),
  },
  "@/lib/constants": { SESSION_COOKIE_NAME: "session" },
  "./api": { callApi: async () => response },
});

test("failed use-case reads never become an empty catalog or a false not-found", async () => {
  const failed = loadSource(
    "src/apis/use-cases.ts",
    readMocks({ success: false, code: 503, message: "Unavailable" }),
  );
  await assert.rejects(failed.getUseCases("program"));
  await assert.rejects(failed.getAssignedUseCases("program"));
  await assert.rejects(failed.getUseCaseDetails(1));
  const missing = loadSource(
    "src/apis/use-cases.ts",
    readMocks({ success: false, code: 404, message: "Not found" }),
  );
  assert.equal((await missing.getUseCaseDetails(1)).kind, "not_found");
});

test("a failed focus request differs from a successful response with no next task", async () => {
  const failed = loadSource(
    "src/apis/learnings.ts",
    readMocks({ success: false, code: 502, message: "Unavailable" }),
  );
  await assert.rejects(failed.getTodayFocus("program"));
  const empty = loadSource(
    "src/apis/learnings.ts",
    readMocks({ success: true, data: { focus: null } }),
  );
  assert.equal(await empty.getTodayFocus("program"), null);
});

test("authentication outage does not pretend the session is invalid", async () => {
  const mocks = {
    ...readMocks({ success: false, code: 503 }),
    react: { cache: (fn) => fn },
  };
  await assert.rejects(loadSource("src/apis/auth.ts", mocks).checkSession());
  assert.equal(
    await loadSource("src/apis/auth.ts", {
      ...readMocks({ success: false, code: 401 }),
      react: { cache: (fn) => fn },
    }).checkSession(),
    null,
  );
});

test("dashboard sections retain the difference between failure and successful empty data", async () => {
  const { captureApiRead } = loadSource("src/apis/api.ts");
  assert.equal((await captureApiRead(Promise.resolve(null))).failed, false);
  const failed = await captureApiRead(Promise.reject(new Error("Unavailable")));
  assert.equal(failed.failed, true);
  assert.equal(failed.data, null);
});

test("required input errors remain associated with their field", () => {
  const Input = loadSource("src/components/fields/InputAILN.tsx").default;
  const html = renderToStaticMarkup(
    React.createElement(Input, {
      inputId: "email",
      inputName: "Email",
      inputType: "email",
      value: "",
      variant: "STUDENT",
      required: true,
      errorMessage: "Isi email dulu.",
      "aria-describedby": "email-help",
    }),
  );
  assert.match(html, /required=""/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /aria-describedby="email-help email-error"/);
  assert.match(html, /id="email-error"/);
});

test("editing the guided proof URL never calls the file-removal callback", () => {
  const calls = [];
  const placeholders = Object.fromEntries(
    [
      "GuidedFileFieldAILN",
      "InputAILN",
      "NumberInputAILN",
      "RatingScaleAILN",
      "SelectAILN",
      "TextAreaAILN",
    ].map((name) => [
      `@/components/fields/${name}`,
      { __esModule: true, default: () => null },
    ]),
  );
  const Component = loadSource(
    "src/components/forms/guided-use-case/GuidedEvidenceAILN.tsx",
    {
      ...placeholders,
      "@/components/elements/GuidedHintAILN": {
        __esModule: true,
        default: () => null,
      },
      "@/lib/guided-use-case": {
        GUIDED_TYPES: [],
        isGuidedProofLink: () => true,
      },
    },
  ).default;
  const tree = Component({
    value: { outcome_proof: "", testimonial: "" },
    file: null,
    onFileChange: () => calls.push("file-cleared"),
    onLinkChange: (url) => calls.push(url),
    onChange: () => {},
    minutesWithoutAi: 10,
    showName: false,
    uploading: false,
  });
  function find(element) {
    if (!React.isValidElement(element)) return null;
    if (element.props.inputId === "guided-outcome-link") return element;
    for (const child of React.Children.toArray(element.props.children)) {
      const result = find(child);
      if (result) return result;
    }
    return null;
  }
  find(tree).props.onInputChange("https://example.test/proof.pdf");
  assert.deepEqual(calls, ["https://example.test/proof.pdf"]);
});

test("opening learning pages does not mark content complete before confirmation", async () => {
  let completions = 0;
  const ui = { __esModule: true, default: () => null };
  const learning = {
    getVideoDetails: async () => ({
      kind: "ok",
      data: { id: 1, completed: false },
    }),
    getMaterialDetails: async () => ({
      kind: "ok",
      data: { id: "material", completed: false },
    }),
    getLevelMaterials: async () => null,
    completeVideo: async () => {
      completions += 1;
    },
    completeMaterial: async () => {
      completions += 1;
    },
  };
  const VideoPage = loadSource(
    "src/app/(lms)/lms/[project_id]/student/(gated)/videos/[video_id]/page.tsx",
    {
      "@/apis/learnings": learning,
      "@/components/pages/VideoDetailsAILN": ui,
      "@/components/states/AppPageState": ui,
    },
  ).default;
  const MaterialPage = loadSource(
    "src/app/(lms)/lms/[project_id]/student/(gated)/materials/[material_id]/page.tsx",
    {
      "@/apis/learnings": learning,
      "@/components/pages/MaterialDetailsAILN": ui,
      "@/components/states/AppPageState": ui,
    },
  ).default;
  const video = await VideoPage({ params: Promise.resolve({ video_id: "1" }) });
  const material = await MaterialPage({
    params: Promise.resolve({ material_id: "material" }),
  });
  assert.equal(completions, 0);
  assert.equal(video.props.video.completed, false);
  assert.equal(material.props.material.completed, false);
});

test("legacy Prompt notifications cannot navigate into the retired task journey", () => {
  const { notificationHref } = loadSource("src/lib/notifications.ts", {
    "@/lib/date-time-manipulation": {
      formatChapterSessionDate: (value) => value,
    },
  });
  for (const type of [
    "prompt_assigned",
    "prompt_deadline",
    "prompt_reviewed",
    "prompt_submitted",
  ]) {
    assert.equal(notificationHref("program", { type, ref_id: "1" }), null);
  }
  assert.equal(
    notificationHref("program", { type: "use_case_assigned", ref_id: "1" }),
    "/program/student/skill-practice/use-cases/1",
  );
});

test("guided practice hides non-guided assignments", async () => {
  const { captureApiRead } = loadSource("src/apis/api.ts");
  const Page = loadSource(
    "src/app/(lms)/lms/[project_id]/student/(gated)/skill-practice/page.tsx",
    {
      "@/apis/api": { captureApiRead },
      "@/apis/use-cases": {
        getAssignedUseCases: async () => [{ id: 7 }, { id: 8 }],
        getGuidedSession: async ({ use_case_id }) => ({
          success: true,
          data: use_case_id === 7 ? { id: 99 } : null,
        }),
      },
      "@/components/pages/SkillPracticeStudentAILN": {
        __esModule: true,
        default: () => null,
      },
    },
  ).default;
  const view = await Page({
    params: Promise.resolve({ project_id: "program" }),
  });
  assert.equal(view.props.assignedFailed, false);
  assert.deepEqual(
    view.props.assignedUseCases.map((item) => item.id),
    [7],
  );
  assert.equal("useCaseLibrary" in view.props, false);
});

test("personal workflows stay visible in practice before final submission", async () => {
  const session = {
    id: 73,
    project_id: "program",
    use_case_id: null,
    current_step: 4,
    steps: [{ id: 1 }],
    daily_task: "Rekap laporan penjualan",
    summary: "Buat dan cek ringkasan dengan AI",
  };
  const ui = { __esModule: true, default: () => null };
  const { captureApiRead } = loadSource("src/apis/api.ts");
  const Page = loadSource(
    "src/app/(lms)/lms/[project_id]/student/(gated)/skill-practice/page.tsx",
    {
      "@/apis/api": { captureApiRead },
      "@/apis/use-cases": {
        getAssignedUseCases: async () => [],
        getGuidedSession: async () => ({ success: true, data: session }),
      },
      "@/components/pages/SkillPracticeStudentAILN": ui,
    },
  ).default;
  const view = await Page({
    params: Promise.resolve({ project_id: "program" }),
  });
  assert.equal(view.props.personalSession, session);
  assert.equal(view.props.personalFailed, false);
  assert.equal(view.props.assignedUseCases.length, 0);

  const Card = loadSource("src/components/cards/GuidedSessionCardAILN.tsx", {
    "@/lib/guided-use-case": {
      GUIDED_STAGES: [{}, {}, {}, { title: "Saran Workflow" }],
    },
    "next/link": {
      __esModule: true,
      default: ({ children, ...props }) =>
        React.createElement("a", props, children),
    },
  }).default;
  const html = renderToStaticMarkup(
    React.createElement(Card, { session, projectId: "program" }),
  );
  assert.match(
    html,
    /\/program\/student\/skill-practice\/guided\?session_id=73/,
  );
  assert.match(html, /Lanjutkan/);
});

test("new workflows invalidate the rewritten practice page for return navigation", async () => {
  const invalidated = [];
  const { RefreshSkillPractice } = loadSource("src/lib/actions.ts", {
    "@/lib/status_code": { STATUS_NO_CONTENT: 204 },
    "@/apis/auth": {
      checkSession: async () => ({
        project_access: [{ id: "program", role: "champion" }],
      }),
    },
    "next/cache": { revalidatePath: (path) => invalidated.push(path) },
  });
  await RefreshSkillPractice("program");
  assert.deepEqual(invalidated, ["/lms/program/student/skill-practice"]);
  await assert.rejects(() => RefreshSkillPractice("another-program"));
  assert.equal(invalidated.length, 1);
});

test("workflow improvement stays available after the former quota is exhausted", () => {
  const ui = { __esModule: true, default: () => null };
  const Workflow = loadSource(
    "src/components/forms/guided-use-case/GuidedWorkflowAILN.tsx",
    {
      "@/components/buttons/ButtonAILN": {
        __esModule: true,
        default: ({ children, disabled, ...props }) =>
          React.createElement(
            "button",
            { disabled, "aria-haspopup": props["aria-haspopup"] },
            children,
          ),
      },
      "@/components/items/GuidedWorkflowItemAILN": ui,
      "@/components/forms/guided-use-case/GuidedWorkflowPreviewAILN": {
        __esModule: true,
        default: ({ action }) => React.createElement("div", null, action),
      },
      "@/components/modals/ImproveGuidedWorkflowModalAILN": ui,
      "@/components/elements/GuidedHintAILN": ui,
      "@/components/elements/GuidedProgressGaugeAILN": ui,
      "@/lib/format": { formatDecimal: String },
      "radix-ui": {
        Accordion: {
          Root: ({ children }) => React.createElement("div", null, children),
        },
      },
    },
  ).default;
  const html = renderToStaticMarkup(
    React.createElement(Workflow, {
      session: {
        regenerate_remaining: 0,
        risks: [],
        minutes_without_ai: 90,
        estimated_minutes_with_ai: 30,
      },
      steps: [{ id: 1 }],
      checklist: false,
      generating: false,
      onGenerate: async () => true,
      onStepChange: () => {},
      onStepCommit: () => {},
    }),
  );
  assert.match(html, /aria-haspopup="dialog"/);
  assert.match(html, /Perbaiki workflow/);
  assert.doesNotMatch(html, /disabled|kuota|Sisa/);
});

test("workflow page resumes the generated session on refresh", async () => {
  const lookups = [];
  const session = {
    id: 73,
    project_id: "program",
    use_case_id: null,
    current_step: 4,
    steps: [{ id: 1 }],
  };
  const ui = { __esModule: true, default: () => null };
  const Page = loadSource(
    "src/app/(lms)/lms/[project_id]/student/(gated)/skill-practice/guided/page.tsx",
    {
      "@/apis/api": {
        captureApiRead: async (request) => ({
          data: await request,
          failed: false,
        }),
      },
      "@/apis/use-cases": {
        getGuidedSession: async (input) => {
          lookups.push(input);
          return { success: true, data: session };
        },
        getUseCaseDetails: async () => {
          throw new Error("Personal drafts have no assignment yet");
        },
      },
      "@/components/forms/GuidedUseCaseAILN": ui,
      "@/components/pages/PageContainerAILN": ui,
      "@/components/states/AppPageState": ui,
      "@/components/states/LoadErrorAILN": ui,
    },
  ).default;
  const view = await Page({
    params: Promise.resolve({ project_id: "program" }),
    searchParams: Promise.resolve({ session_id: "73" }),
  });
  assert.equal(lookups[0].session_id, 73);
  assert.equal(lookups[0].project_id, "program");
  assert.equal(view.props.children.props.initialSession, session);
  assert.equal(view.props.children.key, "73");
});

test("a guided session cannot be opened under a different program", async () => {
  const ui = { __esModule: true, default: () => null };
  const Page = loadSource(
    "src/app/(lms)/lms/[project_id]/student/(gated)/skill-practice/guided/page.tsx",
    {
      "@/apis/api": {},
      "@/apis/use-cases": {
        getGuidedSession: async () => ({
          success: true,
          data: { id: 73, project_id: "another-program", use_case_id: null },
        }),
      },
      "@/components/forms/GuidedUseCaseAILN": ui,
      "@/components/pages/PageContainerAILN": ui,
      "@/components/states/AppPageState": ui,
      "@/components/states/LoadErrorAILN": ui,
    },
  ).default;
  const view = await Page({
    params: Promise.resolve({ project_id: "program" }),
    searchParams: Promise.resolve({ session_id: "73" }),
  });
  assert.equal(view.props.variant, "NOT_FOUND");
});

function renderHome(projects) {
  const link = {
    __esModule: true,
    default: ({ children, ...props }) => {
      delete props.prefetch;
      return React.createElement("a", props, children);
    },
  };
  const image = { __esModule: true, default: () => null };
  const ProjectCard = loadSource(
    "src/components/cards/ProjectJumpBackInCardAILN.tsx",
    { "next/link": link, "next/image": image },
  ).default;
  const Home = loadSource("src/components/pages/HomeAILN.tsx", {
    "next/link": link,
    "next/image": image,
    "next/navigation": { useRouter: () => ({ push() {}, refresh() {} }) },
    "@/lib/actions": { DeleteSession: async () => {} },
    "@/lib/config": { LOGIN_URL: "/auth/login" },
    "@/components/buttons/ButtonAILN": {
      __esModule: true,
      default: ({ children }) => React.createElement("button", null, children),
    },
    "@/components/buttons/ThemeSwitcherAILN": {
      __esModule: true,
      default: () => null,
    },
    "@/components/elements/LogoAileneAILN": { LogoAileneAILN: () => null },
    "@/components/cards/ProjectJumpBackInCardAILN": {
      __esModule: true,
      default: ProjectCard,
    },
  }).default;
  return renderToStaticMarkup(
    React.createElement(Home, {
      session: {
        user: { full_name: "Test Learner", avatar: null, job_title: "" },
        project_access: projects,
      },
    }),
  );
}

const homeProject = {
  id: "program-one",
  name: "Program AI untuk Tim",
  company_name: "Example Company",
  avatar: null,
  group_name: "Operations",
  role: "student",
  has_pre_assessment: false,
};

test("single-program home keeps the assessment entry point with the Buka LMS action", () => {
  const html = renderHome([homeProject]);
  assert.ok(html.includes('href="/program-one/student/pre-assessment"'));
  assert.ok(html.includes("Buka LMS"));
  assert.ok(!html.includes('id="next-step-title"'));
  assert.ok(!html.includes('id="shortcuts-title"'));
  assert.ok(!html.includes('href="/program-one/student/learning-path"'));
  assert.ok(!html.includes('href="/program-one/student/skill-practice"'));
});

test("assessment-complete students can open the LMS directly", () => {
  const html = renderHome([{ ...homeProject, has_pre_assessment: true }]);
  assert.ok(html.includes('href="/program-one/student"'));
  assert.ok(html.includes("Buka LMS"));
  assert.ok(html.includes("Pre-assessment selesai"));
  assert.ok(!html.includes("Tersedia setelah pre-assessment selesai"));
});

test("Buka LMS preserves Champion and Sponsor role destinations", () => {
  for (const role of ["champion", "sponsor"]) {
    const html = renderHome([{ ...homeProject, role }]);
    assert.ok(html.includes(`href="/program-one/${role}"`));
    assert.ok(html.includes("Buka LMS"));
    assert.ok(!html.includes('href="/program-one/student'));
    assert.ok(!html.includes("Mulai pre-assessment"));
  }
});

test("multiple-program home keeps each program destination without choosing one implicitly", () => {
  const html = renderHome([
    homeProject,
    {
      ...homeProject,
      id: "program-two",
      name: "Program kedua",
      role: "sponsor",
    },
  ]);
  assert.ok(html.includes('href="/program-one/student/pre-assessment"'));
  assert.ok(html.includes('href="/program-two/sponsor"'));
  assert.ok(html.includes("2 program"));
  assert.ok(!html.includes('id="next-step-title"'));
  assert.ok(!html.includes('id="shortcuts-title"'));
});
