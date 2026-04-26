const API_BASE = "/api";
const TOKEN_KEY = "rbac_token";

const state = {
  mode: "login",
  token: localStorage.getItem(TOKEN_KEY),
  profile: null,
  projects: [],
  members: [],
  roles: [],
  activeSection: "overview",
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const classNames = {
  activeTab: "bg-ink text-white",
  inactiveTab: "bg-transparent text-slate-600 hover:bg-paper",
  activeNav: "bg-ink text-white",
  inactiveNav: "text-slate-600 hover:bg-paper hover:text-ink",
};

function init() {
  injectUtilityClasses();
  bindEvents();
  setAuthMode("login");
  showSection("overview");
  checkHealth();

  if (state.token) {
    bootWorkspace();
  } else {
    showAuth();
  }

  refreshIcons();
}

function injectUtilityClasses() {
  const style = document.createElement("style");
  style.textContent = `
    .nav-link { display: flex; width: 100%; align-items: center; gap: .65rem; border-radius: .375rem; padding: .75rem .85rem; font-weight: 800; transition: .18s ease; }
    .mobile-nav { display: inline-flex; align-items: center; justify-content: center; border-radius: .375rem; border: 1px solid #D8DEE8; background: white; padding: .65rem; }
    .panel { border: 1px solid #D8DEE8; background: white; border-radius: .5rem; padding: 1.25rem; }
    .panel-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
    .panel-head h2 { font-size: 1rem; font-weight: 900; letter-spacing: -0.01em; }
    .metric-card { border: 1px solid #D8DEE8; background: white; border-radius: .5rem; padding: 1.25rem; }
    .metric-icon { display: inline-flex; height: 2.5rem; width: 2.5rem; align-items: center; justify-content: center; border-radius: .375rem; }
    .metric-label { margin-top: 1rem; color: #64748b; font-size: .78rem; font-weight: 800; text-transform: uppercase; letter-spacing: .16em; }
    .metric-value { margin-top: .25rem; font-size: 2rem; line-height: 1; font-weight: 900; letter-spacing: -.04em; }
    .field-title { color: #64748b; font-size: .75rem; font-weight: 800; text-transform: uppercase; letter-spacing: .15em; }
    .field-value { margin-top: .35rem; font-weight: 800; }
    .primary-btn { display: inline-flex; width: 100%; align-items: center; justify-content: center; gap: .5rem; border-radius: .375rem; background: #172033; color: white; padding: .82rem 1rem; font-size: .875rem; font-weight: 900; transition: .18s ease; }
    .primary-btn:hover { background: #176B87; }
    .primary-btn:disabled { cursor: wait; opacity: .65; }
    .icon-btn { display: inline-flex; align-items: center; justify-content: center; border-radius: .375rem; border: 1px solid #D8DEE8; padding: .55rem; color: #334155; transition: .18s ease; }
    .icon-btn:hover { background: #F6F8FB; color: #172033; }
    .chip { display: inline-flex; align-items: center; border-radius: .375rem; border: 1px solid #D8DEE8; background: #F6F8FB; padding: .45rem .65rem; font-size: .78rem; font-weight: 800; color: #334155; }
    .danger-btn { display: inline-flex; align-items: center; justify-content: center; gap: .35rem; border-radius: .375rem; border: 1px solid #fecaca; color: #b91c1c; padding: .45rem .6rem; font-size: .78rem; font-weight: 800; }
    .danger-btn:hover { background: #fef2f2; }
  `;
  document.head.appendChild(style);
}

function bindEvents() {
  $$(".auth-tab").forEach((button) => {
    button.addEventListener("click", () => setAuthMode(button.dataset.mode));
  });

  $("#auth-form").addEventListener("submit", handleAuth);
  $("#logout-btn").addEventListener("click", logout);
  $("#mobile-logout-btn").addEventListener("click", logout);
  $("#project-form").addEventListener("submit", createProject);
  $("#invite-form").addEventListener("submit", inviteMember);
  $("#refresh-projects").addEventListener("click", loadProjects);
  $("#refresh-members").addEventListener("click", loadMembers);
  $("#refresh-roles").addEventListener("click", loadRoles);

  $$(".nav-link, .mobile-nav").forEach((button) => {
    button.addEventListener("click", () => showSection(button.dataset.section));
  });
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function setAuthMode(mode) {
  state.mode = mode;
  const isRegister = mode === "register";

  $("#company-field").classList.toggle("hidden", !isRegister);
  $("#company-name").required = isRegister;
  $("#auth-kicker").textContent = isRegister ? "Create tenant" : "Sign in";
  $("#auth-title").textContent = isRegister ? "Register organization" : "Workspace login";
  $("#auth-copy").textContent = isRegister
    ? "Creates a tenant, an OWNER account, and the default RBAC roles."
    : "Use an existing tenant user account.";
  $("#auth-submit").innerHTML = `
    <i data-lucide="${isRegister ? "building-2" : "log-in"}" class="h-4 w-4"></i>
    <span>${isRegister ? "Register org" : "Login"}</span>
  `;
  delete $("#auth-submit").dataset.originalText;

  $$(".auth-tab").forEach((button) => {
    const active = button.dataset.mode === mode;
    button.className = `auth-tab rounded-md px-4 py-3 text-sm font-bold ${active ? classNames.activeTab : classNames.inactiveTab}`;
  });

  hideAlert("auth-alert");
  refreshIcons();
}

async function handleAuth(event) {
  event.preventDefault();
  const email = $("#email").value.trim();
  const password = $("#password").value;

  try {
    setBusy("#auth-submit", true);

    if (state.mode === "register") {
      const companyName = $("#company-name").value.trim();
      await api("/auth/register", {
        method: "POST",
        body: { companyName, email, password },
        auth: false,
      });
      setAuthMode("login");
      $("#email").value = email;
      $("#password").value = "";
      showAlert("auth-alert", "Organization registered. Login with the owner account.", "success");
      return;
    }

    const response = await api("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    });

    state.token = response.data.token;
    localStorage.setItem(TOKEN_KEY, state.token);
    await bootWorkspace();
  } catch (error) {
    showAlert("auth-alert", error.message, "error");
  } finally {
    setBusy("#auth-submit", false);
  }
}

async function bootWorkspace() {
  try {
    showApp();
    await loadProfile();
    await Promise.allSettled([loadProjects(), loadRoles(), loadMembers()]);
    renderAll();
  } catch (error) {
    logout();
    showAlert("auth-alert", error.message, "error");
  }
}

async function loadProfile() {
  const response = await api("/users/me");
  state.profile = response.data;
  renderProfile();
}

async function loadProjects() {
  try {
    const response = await api("/projects");
    state.projects = response.data.projects || [];
    renderProjects();
  } catch (error) {
    showAlert("app-alert", error.message, "error");
  }
}

async function loadRoles() {
  try {
    const response = await api("/roles");
    state.roles = response.data.roles || [];
    renderRoles();
    renderInviteRoles();
  } catch (error) {
    state.roles = [];
    renderRoles(error.message);
    renderInviteRoles();
  }
}

async function loadMembers() {
  try {
    const response = await api("/tenants/member");
    state.members = response.data.members || [];
    renderMembers();
  } catch (error) {
    state.members = [];
    renderMembers(error.message);
  }
}

async function createProject(event) {
  event.preventDefault();

  const projectName = $("#project-name").value.trim();
  if (!projectName) return;

  try {
    setBusy("#create-project-btn", true);
    const response = await api("/projects", {
      method: "POST",
      body: { projectName },
    });
    $("#project-name").value = "";
    showAlert("app-alert", response.message, "success");
    await loadProjects();
  } catch (error) {
    showAlert("app-alert", error.message, "error");
  } finally {
    setBusy("#create-project-btn", false);
  }
}

async function deleteProject(projectId) {
  try {
    await api(`/projects/${projectId}`, { method: "DELETE" });
    showAlert("app-alert", "Project deleted.", "success");
    await loadProjects();
  } catch (error) {
    showAlert("app-alert", error.message, "error");
  }
}

async function inviteMember(event) {
  event.preventDefault();

  const email = $("#invite-email").value.trim();
  const roleId = $("#invite-role").value;
  if (!email || !roleId) {
    showAlert("app-alert", "Select a role before inviting. If the role list is blocked, your account needs role:view.", "error");
    return;
  }

  try {
    setBusy("#invite-btn", true);
    const response = await api("/tenants/member", {
      method: "POST",
      body: { email, roleId },
    });
    $("#invite-email").value = "";
    showAlert("app-alert", `Member invited. Temporary password: ${response.data.user.temporaryPassword}`, "success");
    await loadMembers();
  } catch (error) {
    showAlert("app-alert", error.message, "error");
  } finally {
    setBusy("#invite-btn", false);
  }
}

async function changeMemberRole(userId, roleId) {
  try {
    const response = await api(`/users/${userId}/role`, {
      method: "PATCH",
      body: { roleId },
    });
    showAlert("app-alert", response.message, "success");
    await loadMembers();
  } catch (error) {
    showAlert("app-alert", error.message, "error");
  }
}

async function deleteMember(userId) {
  try {
    const response = await api(`/users/${userId}`, { method: "DELETE" });
    showAlert("app-alert", response.message, "success");
    await loadMembers();
  } catch (error) {
    showAlert("app-alert", error.message, "error");
  }
}

async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) throw new Error("Offline");
    $("#health-pill").innerHTML = '<span class="h-2 w-2 rounded-full bg-emerald-500"></span> Online';
  } catch {
    $("#health-pill").innerHTML = '<span class="h-2 w-2 rounded-full bg-danger"></span> Offline';
  }
}

async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (options.auth !== false && state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const label = data.error ? `${data.error}: ` : "";
    throw new Error(`${label}${data.message || `Request failed with ${response.status}`}`);
  }

  return data;
}

function renderAll() {
  renderProfile();
  renderProjects();
  renderRoles();
  renderMembers();
  renderInviteRoles();
  refreshIcons();
}

function renderProfile() {
  if (!state.profile) return;

  $("#sidebar-email").textContent = state.profile.email;
  $("#metric-role").textContent = state.profile.role;
  $("#metric-permissions").textContent = hasWildcard() ? "All" : state.profile.permissions.length;
  $("#profile-email").textContent = state.profile.email;
  $("#profile-user-id").textContent = state.profile.userId;
  $("#profile-tenant-id").textContent = state.profile.tenantId;
  $("#profile-role-pill").textContent = state.profile.role;
  $("#permission-mode").textContent = hasWildcard() ? "Wildcard access" : "Scoped access";

  $("#permission-list").innerHTML = state.profile.permissions
    .map((permission) => `<span class="chip">${escapeHtml(permission)}</span>`)
    .join("");

  updateActionStates();
  updateMetrics();
}

function renderProjects() {
  $("#metric-projects").textContent = state.projects.length;
  const list = $("#project-list");

  if (!state.projects.length) {
    list.innerHTML = emptyState("folder-open", "No projects found.");
    refreshIcons();
    return;
  }

  list.innerHTML = state.projects
    .map((project) => `
      <div class="flex flex-wrap items-center justify-between gap-3 rounded-md border border-line bg-paper p-4">
        <div>
          <p class="font-extrabold">${escapeHtml(project.name)}</p>
          <p class="mt-1 text-xs font-semibold text-slate-500">${escapeHtml(project._id)}</p>
        </div>
        <button class="danger-btn" data-delete-project="${escapeHtml(project._id)}">
          <i data-lucide="trash-2" class="h-4 w-4"></i>
          Delete
        </button>
      </div>
    `)
    .join("");

  $$("[data-delete-project]").forEach((button) => {
    button.addEventListener("click", () => deleteProject(button.dataset.deleteProject));
  });
  refreshIcons();
}

function renderRoles(errorMessage) {
  const list = $("#role-list");

  if (errorMessage) {
    list.innerHTML = emptyState(
      "lock",
      `${errorMessage}. This is the RBAC check from /api/roles. OWNER can see all roles because it has wildcard permission (*). Other roles need role:view.`,
    );
    refreshIcons();
    return;
  }

  if (!state.roles.length) {
    list.innerHTML = emptyState("key-round", "No roles loaded.");
    refreshIcons();
    return;
  }

  list.innerHTML = state.roles
    .map((role) => `
      <article class="rounded-md border border-line bg-paper p-4">
        <div class="flex items-start justify-between gap-3">
          <h3 class="text-lg font-extrabold">${escapeHtml(role.name)}</h3>
          <span class="rounded-md bg-white px-2 py-1 text-xs font-bold text-slate-500">${role.permissions.length}</span>
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
          ${role.permissions.map((permission) => `<span class="chip">${escapeHtml(permission)}</span>`).join("")}
        </div>
      </article>
    `)
    .join("");

  refreshIcons();
}

function renderInviteRoles() {
  const select = $("#invite-role");

  if (!state.roles.length) {
    select.innerHTML = '<option value="">No role catalog access</option>';
    updateActionStates();
    return;
  }

  select.innerHTML = state.roles
    .map((role) => `<option value="${escapeHtml(role._id)}">${escapeHtml(role.name)}</option>`)
    .join("");
  updateActionStates();
}

function renderMembers(errorMessage) {
  $("#metric-members").textContent = state.members.length;
  const list = $("#member-list");

  if (errorMessage) {
    list.innerHTML = emptyState(
      "lock",
      `${errorMessage}. This is the RBAC check from /api/tenants/member. OWNER can see members with wildcard permission (*). Other roles need user:view.`,
    );
    refreshIcons();
    return;
  }

  if (!state.members.length) {
    list.innerHTML = emptyState("users", "No members loaded.");
    refreshIcons();
    return;
  }

  const roleOptions = state.roles
    .map((role) => `<option value="${escapeHtml(role._id)}">${escapeHtml(role.name)}</option>`)
    .join("");

  list.innerHTML = `
    <table class="min-w-full text-left text-sm">
      <thead class="border-b border-line text-xs uppercase tracking-[0.16em] text-slate-500">
        <tr>
          <th class="py-3 pr-4">Email</th>
          <th class="py-3 pr-4">Role</th>
          <th class="py-3 pr-4">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-line">
        ${state.members
          .map((member) => `
            <tr>
              <td class="py-4 pr-4 font-bold">${escapeHtml(member.email)}</td>
              <td class="py-4 pr-4">
                ${
                  state.roles.length
                    ? `<select class="role-select rounded-md border border-line bg-paper px-3 py-2 font-bold" data-user-role="${escapeHtml(member._id)}">
                        ${roleOptions}
                      </select>`
                    : `<span class="chip">${escapeHtml(member.roleId?.name || "No Role")}</span>`
                }
              </td>
              <td class="py-4 pr-4">
                <button class="danger-btn" data-delete-member="${escapeHtml(member._id)}">
                  <i data-lucide="user-x" class="h-4 w-4"></i>
                  Remove
                </button>
              </td>
            </tr>
          `)
          .join("")}
      </tbody>
    </table>
  `;

  $$(".role-select").forEach((select) => {
    const member = state.members.find((item) => item._id === select.dataset.userRole);
    select.value = member?.roleId?._id || "";
    select.addEventListener("change", () => changeMemberRole(select.dataset.userRole, select.value));
  });

  $$("[data-delete-member]").forEach((button) => {
    button.addEventListener("click", () => deleteMember(button.dataset.deleteMember));
  });
  refreshIcons();
}

function updateMetrics() {
  $("#metric-projects").textContent = state.projects.length;
  $("#metric-members").textContent = state.members.length;
}

function updateActionStates() {
  $("#create-project-btn").disabled = false;
  $("#project-name").disabled = false;
  $("#project-create-state").textContent = can("project:create")
    ? "Allowed"
    : "Try it: backend will deny";

  $("#invite-btn").disabled = false;
  $("#invite-email").disabled = false;
  $("#invite-role").disabled = false;
  $("#invite-state").textContent = can("user:invite")
    ? "Allowed"
    : "Try it: backend will deny";
}

function showSection(section) {
  state.activeSection = section;
  $$(".workspace-section").forEach((element) => {
    element.classList.toggle("hidden", element.id !== `section-${section}`);
  });

  const titles = {
    overview: "Overview",
    projects: "Projects",
    members: "Members",
    roles: "Roles",
  };

  $("#workspace-title").textContent = titles[section];

  $$(".nav-link, .mobile-nav").forEach((button) => {
    const active = button.dataset.section === section;
    if (button.classList.contains("nav-link")) {
      button.className = `nav-link ${active ? classNames.activeNav : classNames.inactiveNav}`;
    } else {
      button.className = `mobile-nav ${active ? classNames.activeNav : ""}`;
    }
  });

  refreshIcons();
}

function showApp() {
  $("#auth-screen").classList.add("hidden");
  $("#app-screen").classList.remove("hidden");
}

function showAuth() {
  $("#app-screen").classList.add("hidden");
  $("#auth-screen").classList.remove("hidden");
}

function logout() {
  localStorage.removeItem(TOKEN_KEY);
  state.token = null;
  state.profile = null;
  state.projects = [];
  state.members = [];
  state.roles = [];
  $("#password").value = "";
  showAuth();
}

function can(permission) {
  if (!state.profile) return false;
  return hasWildcard() || state.profile.permissions.includes(permission);
}

function hasWildcard() {
  return Boolean(state.profile?.permissions?.includes("*"));
}

function setBusy(selector, busy) {
  const button = $(selector);
  button.disabled = busy;
  button.dataset.originalText ||= button.innerHTML;
  button.innerHTML = busy
    ? '<i data-lucide="loader-2" class="h-4 w-4 animate-spin"></i><span>Working</span>'
    : button.dataset.originalText;
  refreshIcons();
}

function showAlert(id, message, type) {
  const element = $(`#${id}`);
  element.className = `mb-5 rounded-md border px-4 py-3 text-sm font-semibold ${
    type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-red-200 bg-red-50 text-red-800"
  }`;
  element.textContent = message;
}

function hideAlert(id) {
  const element = $(`#${id}`);
  element.classList.add("hidden");
  element.textContent = "";
}

function emptyState(icon, message) {
  return `
    <div class="rounded-md border border-dashed border-line bg-paper p-8 text-center">
      <div class="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-white text-slate-500">
        <i data-lucide="${icon}" class="h-5 w-5"></i>
      </div>
      <p class="mt-3 text-sm font-bold text-slate-600">${escapeHtml(message)}</p>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.addEventListener("DOMContentLoaded", init);
