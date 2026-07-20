# Technical Quality Gaps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing SeniorEase requirements verifiable through CI test gates, cross-platform composition tests, and a repeatable accessibility acceptance checklist.

**Architecture:** Keep production code unchanged. Add tests at the `features` composition root, where the same stores and platform ports meet, and use in-memory ports. Extend existing GitHub Actions workflows with the root test command. Keep automated accessibility checks beside UI components and document platform checks that cannot be automated here.

**Tech Stack:** pnpm 9, Turborepo, Vitest 3, TypeScript 5, React Native Web, GitHub Actions.

## Global Constraints

- Do not add backend, authentication, cloud synchronization, Service Worker support, or navigation features.
- Do not add runtime dependencies; Vitest is a development dependency only.
- Preserve Clean Architecture: fake storage and notification ports implement `@senior-ease/core` interfaces.
- All changed code must pass `pnpm test`, `pnpm typecheck`, and `pnpm lint`.
- User-visible copy remains in `packages/i18n`; this work adds no UI copy.

---

## File Structure

- Modify `packages/features/package.json`: expose the package test script and declare Vitest.
- Create `packages/features/src/create-app-stores.test.ts`: exercise the composition root with in-memory platform ports.
- Modify `.github/workflows/deploy-web.yml` and `.github/workflows/build-apk.yml`: block builds on the root test suite.
- Create `packages/ui/src/components/SegmentedControl.test.tsx` and `packages/ui/src/components/Toggle.test.tsx`: protect accessible semantics and 48dp targets.
- Create `docs/accessibility-checklist.md`: versioned manual acceptance steps for Web and Android.
- Modify `pnpm-lock.yaml`: record the declared `@senior-ease/features` Vitest dependency.

## Task 1: Add composition-root integration coverage

**Files:**

- Create: `packages/features/src/create-app-stores.test.ts`
- Modify: `packages/features/package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**

- Consumes: `createAppStores(storage: StoragePort, notifications: NotificationSchedulerPort): AppStores`.
- Produces: a `pnpm --filter @senior-ease/features test` command that runs composition tests.

- [ ] **Step 1: Add the package test runner**

In `packages/features/package.json`, add the script and development dependency:

```json
"scripts": {
  "build": "tsc --noEmit",
  "typecheck": "tsc --noEmit",
  "lint": "eslint \"src/**/*.{ts,tsx}\"",
  "test": "vitest run"
},
"devDependencies": {
  "vitest": "3.2.7"
}
```

Run: `pnpm install --lockfile-only`

Expected: `pnpm-lock.yaml` records `vitest` for `packages/features`; no production dependency is added.

- [ ] **Step 2: Write the failing composition tests**

Create `packages/features/src/create-app-stores.test.ts`. Use a `Map<string, string>` for `StoragePort` and a recording `NotificationSchedulerPort` whose permission is `granted`. Cover these exact outcomes:

```ts
it("persists preferences through a new composition root", async () => {
  const storage = makeStorage();
  const first = createAppStores(storage.port, makeScheduler().port);
  first.preferences.getState().setSpacingScale(1.5);
  await vi.waitFor(() => expect(storage.values.get("seniorease.v1")).toBeDefined());

  const second = createAppStores(storage.port, makeScheduler().port);
  await second.preferences.getState().hydrate();
  expect(second.preferences.getState().spacingScale).toBe(1.5);
});

it("moves a stepped activity into history", async () => {
  const stores = createAppStores(makeStorage().port, makeScheduler().port);
  const created = createActivity(
    { title: "Tomar remedio", description: "", steps: ["Separar agua"], due: "" },
    "a1",
    1,
  );
  stores.activities.getState().replaceActivities([created]);
  await vi.waitFor(() => expect(stores.activities.getState().activities).toHaveLength(1));
  stores.activities.getState().replaceActivities([completeActivity(created, 2)]);
  await vi.waitFor(() => expect(listHistory(stores.activities.getState().activities)).toHaveLength(1));
  expect(listHistory(stores.activities.getState().activities)[0]?.title).toBe("Tomar remedio");
});
```

Add two tests with existing store APIs: one calls `request()`, then `cancel()` and `confirm()` on separate confirmation requests; the other calls `hydratePermission()` and `syncReminders()` with a future pending activity and asserts one recorded schedule.

Run: `pnpm --filter @senior-ease/features test`

Expected: FAIL because the test runner and test file do not yet exist.

- [ ] **Step 3: Implement only the in-memory ports and imports required by the tests**

Use these port shapes in the test file; do not add a production fake or change `createAppStores`:

```ts
function makeStorage(): { port: StoragePort; values: Map<string, string> } {
  const values = new Map<string, string>();
  return {
    values,
    port: {
      getItem: async (key) => values.get(key) ?? null,
      setItem: async (key, value) => void values.set(key, value),
      removeItem: async (key) => void values.delete(key),
    },
  };
}

function makeScheduler(): { port: NotificationSchedulerPort; scheduled: ScheduledReminder[] } {
  const scheduled: ScheduledReminder[] = [];
  return {
    scheduled,
    port: {
      isSupported: () => true,
      getPermission: async () => "granted",
      requestPermission: async () => "granted",
      schedule: async (reminder) => void scheduled.push(reminder),
      cancel: async () => undefined,
      cancelAll: async () => undefined,
    },
  };
}
```

Import `createActivity`, `completeActivity`, `listHistory`, `StoragePort`, `NotificationSchedulerPort`, and `ScheduledReminder` from `@senior-ease/core`; import `describe`, `expect`, `it`, and `vi` from `vitest`.

- [ ] **Step 4: Run the focused and repository test suites**

Run: `pnpm --filter @senior-ease/features test && pnpm test`

Expected: the four composition tests pass and the root suite succeeds.

- [ ] **Step 5: Commit the tested composition coverage**

```bash
git add packages/features/package.json packages/features/src/create-app-stores.test.ts pnpm-lock.yaml
git commit -m "test: cover app composition flows"
```

## Task 2: Make tests mandatory before publishing

**Files:**

- Modify: `.github/workflows/deploy-web.yml`
- Modify: `.github/workflows/build-apk.yml`

**Interfaces:**

- Consumes: root script `pnpm test`.
- Produces: a blocking CI quality gate before Web deployment and APK generation.

- [ ] **Step 1: Establish the local precondition**

Run: `pnpm test`

Expected: PASS. This is the exact command that both workflows must execute.

- [ ] **Step 2: Add the test gate to the Web deployment workflow**

In `.github/workflows/deploy-web.yml`, directly after `Instalar dependencias`, add:

```yaml
      - name: Executar testes
        run: pnpm test
```

Keep this step before `Verificar tipos e lint` and before every Vercel command.

- [ ] **Step 3: Add the test gate to the APK workflow**

In `.github/workflows/build-apk.yml`, directly after `Instalar dependencias`, add:

```yaml
      - name: Executar testes
        run: pnpm test
```

Keep it before `Verificar tipos` and `Gerar projeto nativo Android`.

- [ ] **Step 4: Verify workflow syntax and command behavior**

Run: `pnpm test && git diff --check`

Expected: tests pass and no whitespace errors are reported. Inspect both workflow files to confirm every build/deploy step follows `Executar testes`.

- [ ] **Step 5: Commit the CI gate**

```bash
git add .github/workflows/deploy-web.yml .github/workflows/build-apk.yml
git commit -m "ci: require tests before publishing"
```

## Task 3: Make accessibility acceptance repeatable

**Files:**

- Create: `packages/ui/src/components/SegmentedControl.test.tsx`
- Create: `packages/ui/src/components/Toggle.test.tsx`
- Create: `docs/accessibility-checklist.md`

**Interfaces:**

- Consumes: `ThemeProvider`, `SegmentedControl`, `Toggle`, and the existing 48dp token.
- Produces: automated interactive-control coverage plus a manual Web/Android acceptance checklist.

- [ ] **Step 1: Write failing semantic and target-size tests**

In `SegmentedControl.test.tsx`, render the component inside `ThemeProvider` and assert the group and options:

```tsx
renderThemed(
  <SegmentedControl
    accessibilityLabel="Contraste"
    options={[{ value: "standard", label: "Padrao" }, { value: "high", label: "Maximo" }]}
    value="standard"
    onChange={onChange}
  />,
);
expect(screen.getByRole("radiogroup", { name: "Contraste" })).toBeInTheDocument();
expect(screen.getByRole("radio", { name: "Padrao" })).toHaveAttribute("aria-checked", "true");
expect(screen.getByRole("radio", { name: "Maximo" })).toHaveStyle({ minHeight: "48px" });
```

In `Toggle.test.tsx`, assert `role="switch"`, `aria-checked`, 48px minimum height, and that clicking calls `onValueChange(!value)` once.

Run: `pnpm --filter @senior-ease/ui test`

Expected: FAIL until both test files are present.

- [ ] **Step 2: Add the tests without changing component behavior**

Reuse the `renderThemed` helper pattern from `packages/ui/src/components/Button.test.tsx`. Import `describe`, `expect`, `it`, and `vi` from `vitest`; use `@testing-library/react` for `render` and `screen`. Keep these tests in the existing `packages/ui` jsdom configuration.

- [ ] **Step 3: Add the manual acceptance checklist**

Create `docs/accessibility-checklist.md` with these release checks:

```markdown
# Accessibility Acceptance Checklist

## Web

- [ ] Navigate Home, Activities, Personalization, Profile, and History using only Tab, Shift+Tab, Enter, and Escape.
- [ ] Confirm every interactive control has a visible focus indicator and a readable accessible name.
- [ ] Enable the system reduced-motion preference; confirm tour, feedback, dialog, and activity-step transitions do not animate.
- [ ] Test 100%, 150%, and 200% font scales with both contrast palettes; no primary action becomes obscured or unclickable.

## Android

- [ ] Enable TalkBack and complete create, guided execution, completion, deletion, and history-clear flows.
- [ ] Confirm all interactive targets are at least 48dp and feedback is announced after state-changing actions.
- [ ] Enable Remove animations; confirm tour, dialog, feedback, and activity steps do not animate.
```

- [ ] **Step 4: Verify accessibility checks**

Run: `pnpm --filter @senior-ease/ui test && pnpm test && pnpm typecheck && pnpm lint`

Expected: all commands pass. Review the checklist to ensure it names Web keyboard navigation, Android TalkBack, reduced motion, contrast, font scaling, and 48dp targets.

- [ ] **Step 5: Commit the accessibility verification assets**

```bash
git add packages/ui/src/components/SegmentedControl.test.tsx packages/ui/src/components/Toggle.test.tsx docs/accessibility-checklist.md
git commit -m "test: verify accessible control semantics"
```

## Final Verification

- [ ] Run `pnpm test && pnpm typecheck && pnpm lint` from the repository root.
- [ ] Run `git diff master...HEAD --check` and inspect that only CI, test, lockfile, and accessibility-checklist files changed.
- [ ] Confirm both workflows contain `Executar testes` before any build, APK, or deploy command.
- [ ] Execute the manual checklist on Web and Android before release.
