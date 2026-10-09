
"use strict";

/* =========================================================
   GECC CAMPUSVOICE — COMPLETE SCRIPT
   Works with the supplied index.html and style.css
========================================================= */

const STORAGE = {
    announcements: "geccCampusVoiceAnnouncements",
    views: "geccCampusVoiceViews",
    saved: "geccCampusVoiceSaved",
    notifications: "geccCampusVoiceNotifications",
    readNotifications: "geccCampusVoiceReadNotifications"
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

const normalize = (value) =>
    String(value ?? "").trim().toLowerCase();

const escapeHTML = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);

function readStorage(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch (error) {
        console.warn(`Unable to read ${key}`, error);
        return fallback;
    }
}

function writeStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn(`Unable to save ${key}`, error);
        showToast("Unable to save data in this browser.", "error");
    }
}

function createId() {
    return `announcement-${Date.now()}-${Math.random()
        .toString(36).slice(2, 8)}`;
}

function todayISO() {
    const now = new Date();
    const localDate = new Date(
        now.getTime() - now.getTimezoneOffset() * 60000
    );
    return localDate.toISOString().slice(0, 10);
}

function formatDate(value) {
    if (!value) return "Date not specified";

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

/* =========================================================
   SAMPLE ANNOUNCEMENTS
========================================================= */

const defaultAnnouncements = [
    {
        id: "demo-1",
        title: "Internal Assessment Schedule Released",
        description:
            "The internal assessment schedule has been released. Students should check the timetable and contact their department for any clarification.",
        category: "academic",
        type: "exam",
        branch: "all",
        date: todayISO(),
        expiryDate: "",
        author: "Academic Administration",
        views: 25,
        createdAt: Date.now() - 1000
    },
    {
        id: "demo-2",
        title: "Technical Fest 2026 Registration",
        description:
            "Registration is open for the upcoming technical fest. Students can participate in technical competitions, project demonstrations, coding activities and workshops.",
        category: "events",
        type: "event",
        branch: "all",
        date: todayISO(),
        expiryDate: "",
        author: "Event Committee",
        views: 40,
        createdAt: Date.now() - 2000
    },
    {
        id: "demo-3",
        title: "DevOps and Cloud Computing Workshop",
        description:
            "A practical workshop covering Docker, CI/CD, cloud fundamentals and deployment automation. Interested students should contact the CSE department.",
        category: "academic",
        type: "workshop",
        branch: "cse",
        date: todayISO(),
        expiryDate: "",
        author: "CSE Department",
        views: 35,
        createdAt: Date.now() - 3000
    },
    {
        id: "demo-4",
        title: "Campus Placement Drive",
        description:
            "Eligible students are invited to register for the upcoming campus placement drive. Check the eligibility criteria and prepare the required documents.",
        category: "placement",
        type: "placement",
        branch: "all",
        date: todayISO(),
        expiryDate: "",
        author: "Placement Cell",
        views: 50,
        createdAt: Date.now() - 4000
    },
    {
        id: "demo-5",
        title: "CSE Department Circular",
        description:
            "CSE students are requested to check department announcements regularly for laboratory schedules, project guidance and academic updates.",
        category: "general",
        type: "circular",
        branch: "cse",
        date: todayISO(),
        expiryDate: "",
        author: "CSE Department",
        views: 12,
        createdAt: Date.now() - 5000
    },
    {
        id: "demo-6",
        title: "Library Notice for All Students",
        description:
            "Students are requested to return borrowed library books on time and follow the library rules. Contact the library desk for assistance.",
        category: "general",
        type: "notice",
        branch: "all",
        date: todayISO(),
        expiryDate: "",
        author: "Library",
        views: 8,
        createdAt: Date.now() - 6000
    },
    {
        id: "demo-7",
        title: "ECE Technical Seminar",
        description:
            "An upcoming seminar will introduce students to emerging electronics and communication technologies. Contact the ECE department for further information.",
        category: "events",
        type: "event",
        branch: "ece",
        date: todayISO(),
        expiryDate: "",
        author: "ECE Department",
        views: 15,
        createdAt: Date.now() - 7000
    },
    {
        id: "demo-8",
        title: "EEE Laboratory Update",
        description:
            "EEE students should confirm their laboratory batches and follow the instructions shared by their department faculty.",
        category: "academic",
        type: "notice",
        branch: "eee",
        date: todayISO(),
        expiryDate: "",
        author: "EEE Department",
        views: 6,
        createdAt: Date.now() - 8000
    },
    {
        id: "demo-9",
        title: "Mechanical Engineering Project Exhibition",
        description:
            "Mechanical engineering students can showcase their innovative projects and prototypes. Contact the department coordinator to participate.",
        category: "events",
        type: "workshop",
        branch: "me",
        date: todayISO(),
        expiryDate: "",
        author: "Mechanical Department",
        views: 11,
        createdAt: Date.now() - 9000
    },
    {
        id: "demo-10",
        title: "Civil Engineering Department Notice",
        description:
            "Students should check the latest department instructions regarding academic activities, practical sessions and project submissions.",
        category: "academic",
        type: "circular",
        branch: "civil",
        date: todayISO(),
        expiryDate: "",
        author: "Civil Department",
        views: 5,
        createdAt: Date.now() - 10000
    },
    {
        id: "demo-11",
        title: "MBA Management Seminar",
        description:
            "MBA students are invited to attend a management seminar focused on leadership, business communication and professional development.",
        category: "events",
        type: "event",
        branch: "mba",
        date: todayISO(),
        expiryDate: "",
        author: "MBA Department",
        views: 9,
        createdAt: Date.now() - 11000
    },
    {
        id: "demo-12",
        title: "MCA Programming Workshop",
        description:
            "MCA students can participate in a practical programming workshop focused on software development, debugging and project building.",
        category: "academic",
        type: "workshop",
        branch: "mca",
        date: todayISO(),
        expiryDate: "",
        author: "MCA Department",
        views: 14,
        createdAt: Date.now() - 12000
    }
];

/* =========================================================
   APP STATE
========================================================= */

let announcements = [];
let currentCategory = "all";
let currentType = "all";
let currentBranch = "all";
let currentAnnouncementId = null;
let toastTimer = null;

const iconByType = {
    notice: "fa-bell",
    event: "fa-calendar-days",
    exam: "fa-graduation-cap",
    placement: "fa-briefcase",
    workshop: "fa-laptop-code",
    circular: "fa-file-lines"
};

const labelByCategory = {
    academic: "Academic",
    events: "Events",
    placement: "Placement",
    general: "General"
};

const labelByType = {
    notice: "Notice",
    event: "Event",
    exam: "Exam",
    placement: "Placement",
    workshop: "Workshop",
    circular: "Circular"
};

const labelByBranch = {
    all: "All Branches",
    cse: "CSE",
    ece: "ECE",
    eee: "EEE",
    me: "Mechanical",
    civil: "Civil",
    mba: "MBA",
    mca: "MCA"
};

function loadAnnouncements() {
    const stored = readStorage(STORAGE.announcements, null);

    announcements = Array.isArray(stored)
        ? stored
        : defaultAnnouncements.map((item) => ({ ...item }));

    announcements = announcements.map((item) => ({
        ...item,
        id: String(item.id || createId()),
        category: normalize(item.category || "general"),
        type: normalize(item.type || "notice"),
        branch: normalize(item.branch || "all"),
        views: Math.max(0, Number(item.views) || 0),
        createdAt: Number(item.createdAt) || Date.now()
    }));

    saveAnnouncements();
}

function saveAnnouncements() {
    writeStorage(STORAGE.announcements, announcements);
}

/* =========================================================
   TOAST NOTIFICATIONS
========================================================= */

function showToast(message, type = "success") {
    let container = $("#toastContainer");

    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        container.className = "toast-container";
        container.setAttribute("aria-live", "polite");
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.setAttribute("role", "status");

    const icon = document.createElement("i");
    icon.className = type === "error"
        ? "fa-solid fa-circle-exclamation"
        : "fa-solid fa-circle-check";

    const text = document.createElement("span");
    text.textContent = message;

    toast.append(icon, text);
    container.appendChild(toast);

    window.setTimeout(() => {
        toast.remove();
    }, 3500);
}

/* =========================================================
   FILTERS — CATEGORY, TYPE AND BRANCH
========================================================= */

function setActiveFilter(selector, value, attribute) {
    $$(selector).forEach((button) => {
        const selected = normalize(button.dataset[attribute]) === value;

        button.classList.toggle("active", selected);
        button.setAttribute("aria-pressed", String(selected));
    });
}

function getFilteredAnnouncements() {
    const searchText = normalize($("#announcementSearch")?.value);
    const sortMode = $("#sortAnnouncements")?.value || "priority";

    let result = announcements.filter((item) => {
        const category = normalize(item.category);
        const type = normalize(item.type);
        const branch = normalize(item.branch);

        const matchesCategory =
            currentCategory === "all" ||
            category === currentCategory;

        const matchesType =
            currentType === "all" ||
            type === currentType;

        // "all" branch announcements are visible under every branch.
        const matchesBranch =
            currentBranch === "all" ||
            branch === currentBranch ||
            branch === "all";

        const searchableText = normalize([
            item.title,
            item.description,
            item.author,
            item.category,
            item.type,
            item.branch,
            labelByBranch[branch]
        ].join(" "));

        const matchesSearch =
            searchText.length === 0 ||
            searchableText.includes(searchText);

        const notExpired =
            !item.expiryDate ||
            item.expiryDate >= todayISO();

        return (
            matchesCategory &&
            matchesType &&
            matchesBranch &&
            matchesSearch &&
            notExpired
        );
    });

    result.sort((a, b) => {
        switch (sortMode) {
            case "latest":
                return (b.createdAt || 0) - (a.createdAt || 0);

            case "clicks":
                return (b.views || 0) - (a.views || 0);

            case "title":
                return a.title.localeCompare(b.title);

            case "priority":
            default:
                return (
                    (b.views || 0) - (a.views || 0) ||
                    (b.createdAt || 0) - (a.createdAt || 0)
                );
        }
    });

    return result;
}

function setupFilterListeners() {
    $$(".category-filter").forEach((button) => {
        button.addEventListener("click", () => {
            currentCategory = normalize(button.dataset.category || "all");
            setActiveFilter(
                ".category-filter",
                currentCategory,
                "category"
            );
            renderAnnouncements();
        });
    });

    $$(".type-filter").forEach((button) => {
        button.addEventListener("click", () => {
            currentType = normalize(button.dataset.type || "all");
            setActiveFilter(".type-filter", currentType, "type");
            renderAnnouncements();
        });
    });

    $$(".branch-filter").forEach((button) => {
        button.addEventListener("click", () => {
            currentBranch = normalize(button.dataset.branch || "all");
            setActiveFilter(
                ".branch-filter",
                currentBranch,
                "branch"
            );
            renderAnnouncements();
        });
    });

    $("#announcementSearch")?.addEventListener(
        "input",
        renderAnnouncements
    );

    $("#sortAnnouncements")?.addEventListener(
        "change",
        renderAnnouncements
    );

    $("#clearSearch")?.addEventListener("click", () => {
        const search = $("#announcementSearch");
        if (search) {
            search.value = "";
            search.focus();
        }
        renderAnnouncements();
    });

    $("#viewAll")?.addEventListener("click", resetFilters);
    $("#resetNoResults")?.addEventListener("click", resetFilters);
}

function resetFilters() {
    currentCategory = "all";
    currentType = "all";
    currentBranch = "all";

    if ($("#announcementSearch")) {
        $("#announcementSearch").value = "";
    }

    if ($("#sortAnnouncements")) {
        $("#sortAnnouncements").value = "priority";
    }

    setActiveFilter(".category-filter", "all", "category");
    setActiveFilter(".type-filter", "all", "type");
    setActiveFilter(".branch-filter", "all", "branch");

    renderAnnouncements();
}

/* =========================================================
   ANNOUNCEMENT CARDS
========================================================= */

function getSavedIds() {
    const saved = readStorage(STORAGE.saved, []);
    return Array.isArray(saved) ? saved.map(String) : [];
}

function renderAnnouncements() {
    const grid = $("#announcementGrid");
    if (!grid) return;

    const results = getFilteredAnnouncements();
    const savedIds = getSavedIds();

    grid.innerHTML = results.map((item) => {
        const saved = savedIds.includes(String(item.id));
        const category = normalize(item.category);
        const type = normalize(item.type);
        const branch = normalize(item.branch);

        return `
            <article class="announcement-card"
                data-id="${escapeHTML(item.id)}"
                data-category="${escapeHTML(category)}"
                data-type="${escapeHTML(type)}"
                data-branch="${escapeHTML(branch)}">

                <div class="announcement-card-top">
                    <span class="announcement-category category-${escapeHTML(category)}">
                        ${escapeHTML(labelByCategory[category] || category)}
                    </span>

                    <button
                        class="save-announcement ${saved ? "saved" : ""}"
                        type="button"
                        data-action="save"
                        data-id="${escapeHTML(item.id)}"
                        aria-label="${saved ? "Remove saved announcement" : "Save announcement"}"
                        title="${saved ? "Unsave" : "Save"}">
                        <i class="${saved ? "fa-solid" : "fa-regular"} fa-bookmark"></i>
                    </button>
                </div>

                <div class="announcement-card-icon">
                    <i class="fa-solid ${iconByType[type] || "fa-bullhorn"}"></i>
                </div>

                <h3>${escapeHTML(item.title)}</h3>

                <p class="announcement-description">
                    ${escapeHTML(item.description)}
                </p>

                <div class="announcement-meta">
                    <span>
                        <i class="fa-regular fa-calendar"></i>
                        ${escapeHTML(formatDate(item.date))}
                    </span>
                    <span>
                        <i class="fa-solid fa-code-branch"></i>
                        ${escapeHTML(labelByBranch[branch] || branch.toUpperCase())}
                    </span>
                </div>

                <div class="announcement-card-footer">
                    <span class="announcement-type">
                        ${escapeHTML(labelByType[type] || type)}
                    </span>

                    <span class="announcement-views">
                        <i class="fa-regular fa-eye"></i>
                        ${Number(item.views) || 0} views
                    </span>
                </div>

                <div class="announcement-author">
                    <span>Published by ${escapeHTML(item.author)}</span>
                    <button
                        type="button"
                        class="read-more-button"
                        data-action="details"
                        data-id="${escapeHTML(item.id)}">
                        Read more <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </article>
        `;
    }).join("");

    const count = $("#resultCount");
    if (count) {
        count.textContent =
            `${results.length} announcement${results.length === 1 ? "" : "s"}`;
    }

    const noResults = $("#noResults");
    if (noResults) {
        noResults.hidden = results.length !== 0;
    }

    const stat = $("#announcementStat");
    if (stat) {
        stat.textContent = String(announcements.length);
    }

    const popularStat = $("#popularStat");
    if (popularStat) {
        popularStat.textContent = String(
            announcements.reduce(
                (total, item) => total + (Number(item.views) || 0),
                0
            )
        );
    }
}

/* =========================================================
   SAVE / UNSAVE ANNOUNCEMENTS
========================================================= */

function toggleSaved(id) {
    const saved = getSavedIds();
    const key = String(id);

    let updated;

    if (saved.includes(key)) {
        updated = saved.filter((item) => item !== key);
        showToast("Announcement removed from Saved.");
    } else {
        updated = [...saved, key];
        showToast("Announcement added to Saved.");
    }

    writeStorage(STORAGE.saved, updated);
    renderAnnouncements();
}

function openSavedAnnouncement(id) {
    const item = announcements.find(
        (announcement) => String(announcement.id) === String(id)
    );

    if (item) openDetails(id);
}

/* =========================================================
   ANNOUNCEMENT DETAILS MODAL
========================================================= */

function openModal(modal) {
    if (!modal) return;

    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    const focusTarget = $("input, textarea, select, button", modal);
    focusTarget?.focus();
}

function closeModal(modal) {
    if (!modal) return;

    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");

    const anotherOpenModal = $$(".modal-overlay").some(
        (element) => !element.hidden
    );

    if (!anotherOpenModal) {
        document.body.classList.remove("modal-open");
    }
}

function openDetails(id) {
    const item = announcements.find(
        (announcement) => String(announcement.id) === String(id)
    );

    if (!item) {
        showToast("Announcement not found.", "error");
        return;
    }

    currentAnnouncementId = item.id;

    item.views = (Number(item.views) || 0) + 1;
    saveAnnouncements();

    const category = normalize(item.category);
    const type = normalize(item.type);
    const branch = normalize(item.branch);

    const content = $("#detailsContent");
    if (content) {
        content.innerHTML = `
            <div class="details-category">
                ${escapeHTML(labelByCategory[category] || category)}
                · ${escapeHTML(labelByType[type] || type)}
            </div>

            <h2>${escapeHTML(item.title)}</h2>

            <div class="details-meta">
                <span><i class="fa-regular fa-calendar"></i>
                    ${escapeHTML(formatDate(item.date))}</span>
                <span><i class="fa-solid fa-code-branch"></i>
                    ${escapeHTML(labelByBranch[branch] || branch.toUpperCase())}</span>
                <span><i class="fa-regular fa-eye"></i>
                    ${Number(item.views)} views</span>
            </div>

            <p class="details-description">
                ${escapeHTML(item.description)}
            </p>

            <div class="details-publisher">
                <strong>Published by:</strong>
                ${escapeHTML(item.author)}
            </div>

            ${item.expiryDate ? `
                <p class="details-expiry">
                    <strong>Expiry date:</strong>
                    ${escapeHTML(formatDate(item.expiryDate))}
                </p>
            ` : ""}

            <button class="primary-button"
                type="button"
                data-action="save"
                data-id="${escapeHTML(item.id)}">
                <i class="fa-regular fa-bookmark"></i> Save announcement
            </button>
        `;
    }

    renderAnnouncements();

    const modal = $("#detailsModal");
    if (modal) openModal(modal);
}

function setupModalListeners() {
    const createModal = $("#announcementModal");
    const detailsModal = $("#detailsModal");

    const openCreate = () => {
        openModal(createModal);

        const dateInput = $("#announcementDate");
        if (dateInput && !dateInput.value) {
            dateInput.value = todayISO();
        }
    };

    $("#openAnnouncementModal")?.addEventListener("click", openCreate);
    $("#openAnnouncementModalCta")?.addEventListener("click", openCreate);

    $("#closeAnnouncementModal")?.addEventListener("click", () => {
        closeModal(createModal);
    });

    $("#cancelAnnouncement")?.addEventListener("click", () => {
        closeModal(createModal);
    });

    $("#closeDetailsModal")?.addEventListener("click", () => {
        closeModal(detailsModal);
    });

    [createModal, detailsModal].forEach((modal) => {
        modal?.addEventListener("click", (event) => {
            if (event.target === modal) closeModal(modal);
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeModal(createModal);
            closeModal(detailsModal);
        }
    });
}

/* =========================================================
   CREATE ANNOUNCEMENT
========================================================= */

function setupAnnouncementForm() {
    const form = $("#announcementForm");
    if (!form) return;

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const title = $("#announcementTitle")?.value.trim();
        const description = $("#announcementDescription")?.value.trim();
        const category = normalize($("#announcementCategory")?.value);
        const type = normalize($("#announcementType")?.value);
        const branch = normalize($("#announcementBranch")?.value);
        const date = $("#announcementDate")?.value;
        const expiryDate = $("#announcementExpiry")?.value;
        const author = $("#announcementAuthor")?.value.trim();

        if (!title || !description || !date || !author) {
            showToast("Please complete all required fields.", "error");
            return;
        }

        if (expiryDate && expiryDate < date) {
            showToast(
                "Expiry date cannot be before the announcement date.",
                "error"
            );
            return;
        }

        const announcement = {
            id: createId(),
            title,
            description,
            category,
            type,
            branch,
            date,
            expiryDate,
            author,
            views: 0,
            createdAt: Date.now()
        };

        announcements.unshift(announcement);
        saveAnnouncements();

        // Show the new announcement immediately.
        currentCategory = "all";
        currentType = "all";
        currentBranch = "all";

        if ($("#announcementSearch")) {
            $("#announcementSearch").value = "";
        }

        if ($("#sortAnnouncements")) {
            $("#sortAnnouncements").value = "latest";
        }

        setActiveFilter(".category-filter", "all", "category");
        setActiveFilter(".type-filter", "all", "type");
        setActiveFilter(".branch-filter", "all", "branch");

        addNotification(
            "New announcement",
            title
        );

        form.reset();

        if ($("#announcementDate")) {
            $("#announcementDate").value = todayISO();
        }

        closeModal($("#announcementModal"));
        renderAnnouncements();
        showToast("Announcement published successfully.");

        $("#announcements")?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });

    const dateInput = $("#announcementDate");
    if (dateInput) dateInput.value = todayISO();

    const expiryInput = $("#announcementExpiry");
    if (expiryInput && dateInput) {
        expiryInput.min = dateInput.value;

        dateInput.addEventListener("change", () => {
            expiryInput.min = dateInput.value;

            if (expiryInput.value && expiryInput.value < dateInput.value) {
                expiryInput.value = "";
            }
        });
    }
}

/* =========================================================
   NOTIFICATIONS
========================================================= */

function getNotifications() {
    const items = readStorage(STORAGE.notifications, []);
    return Array.isArray(items) ? items : [];
}

function getReadNotificationIds() {
    const items = readStorage(STORAGE.readNotifications, []);
    return Array.isArray(items) ? items.map(String) : [];
}

function addNotification(title, message) {
    const notifications = getNotifications();

    notifications.unshift({
        id: createId(),
        title,
        message,
        date: new Date().toISOString(),
        read: false
    });

    writeStorage(STORAGE.notifications, notifications.slice(0, 50));
    renderNotifications();
}

function renderNotifications() {
    const list = $("#notificationList");
    const badge = $("#notificationBadge");

    const notifications = getNotifications();
    const readIds = getReadNotificationIds();

    const unread = notifications.filter(
        (item) => !item.read && !readIds.includes(String(item.id))
    );

    if (badge) {
        badge.textContent = String(unread.length);
        badge.hidden = unread.length === 0;
    }

    if (!list) return;

    if (notifications.length === 0) {
        list.innerHTML =
            '<p class="empty-notifications">No notifications yet.</p>';
        return;
    }

    list.innerHTML = notifications.map((item) => {
        const isRead = item.read || readIds.includes(String(item.id));

        return `
            <article class="notification-item ${isRead ? "read" : "unread"}">
                <div class="notification-item-icon">
                    <i class="fa-regular fa-bell"></i>
                </div>
                <div class="notification-item-content">
                    <strong>${escapeHTML(item.title)}</strong>
                    <p>${escapeHTML(item.message)}</p>
                    <small>${escapeHTML(
                        new Date(item.date).toLocaleString("en-IN")
                    )}</small>
                </div>
            </article>
        `;
    }).join("");
}

function setupNotificationListeners() {
    const toggle = $("#notificationToggle");
    const panel = $("#notificationPanel");

    toggle?.addEventListener("click", () => {
        if (!panel) return;

        const willOpen = panel.hidden;
        panel.hidden = !willOpen;
        toggle.setAttribute("aria-expanded", String(willOpen));
    });

    $("#markAllRead")?.addEventListener("click", () => {
        const notifications = getNotifications().map((item) => ({
            ...item,
            read: true
        }));

        writeStorage(STORAGE.notifications, notifications);
        writeStorage(
            STORAGE.readNotifications,
            notifications.map((item) => String(item.id))
        );

        renderNotifications();
        showToast("All notifications marked as read.");
    });

    document.addEventListener("click", (event) => {
        if (!panel || panel.hidden) return;

        if (!panel.contains(event.target) && !toggle?.contains(event.target)) {
            panel.hidden = true;
            toggle?.setAttribute("aria-expanded", "false");
        }
    });
}

/* =========================================================
   MOBILE MENU
========================================================= */

function setupMobileMenu() {
    const menuButton = $(".mobile-menu-button");
    const navigation = $(".navigation");

    if (!menuButton || !navigation) return;

    menuButton.addEventListener("click", () => {
        const isOpen = navigation.classList.toggle("open");

        menuButton.setAttribute("aria-expanded", String(isOpen));
        menuButton.setAttribute(
            "aria-label",
            isOpen ? "Close menu" : "Open menu"
        );

        const icon = $("i", menuButton);
        if (icon) {
            icon.className = isOpen
                ? "fa-solid fa-xmark"
                : "fa-solid fa-bars";
        }
    });

    $$(".nav-link", navigation).forEach((link) => {
        link.addEventListener("click", () => {
            navigation.classList.remove("open");
            menuButton.setAttribute("aria-expanded", "false");

            const icon = $("i", menuButton);
            if (icon) icon.className = "fa-solid fa-bars";
        });
    });
}

/* =========================================================
   HERO BUTTONS AND ANNOUNCEMENT CARD ACTIONS
========================================================= */

function setupGeneralActions() {
    $("#exploreButton")?.addEventListener("click", () => {
        $("#announcements")?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });

    $("#eventButton")?.addEventListener("click", () => {
        currentCategory = "events";
        currentType = "all";
        currentBranch = "all";

        setActiveFilter(".category-filter", "events", "category");
        setActiveFilter(".type-filter", "all", "type");
        setActiveFilter(".branch-filter", "all", "branch");

        renderAnnouncements();

        $("#announcements")?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });

    const eventsLink = $('[data-nav-type="event"]');
    eventsLink?.addEventListener("click", (event) => {
        event.preventDefault();

        currentCategory = "events";
        currentType = "all";
        currentBranch = "all";

        setActiveFilter(".category-filter", "events", "category");
        setActiveFilter(".type-filter", "all", "type");
        setActiveFilter(".branch-filter", "all", "branch");

        renderAnnouncements();

        $("#announcements")?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });

    // Event delegation also handles dynamically created cards.
    $("#announcementGrid")?.addEventListener("click", (event) => {
        const button = event.target.closest("[data-action]");
        if (!button) return;

        const { action, id } = button.dataset;
        if (!id) return;

        if (action === "save") {
            toggleSaved(id);
        } else if (action === "details") {
            openDetails(id);
        }
    });

    // Save button inside the details modal.
    $("#detailsContent")?.addEventListener("click", (event) => {
        const button = event.target.closest('[data-action="save"]');
        if (!button) return;

        const id = button.dataset.id;
        if (id) toggleSaved(id);
    });

    // Keep the selected navigation link visually active.
    $$(".nav-link").forEach((link) => {
        link.addEventListener("click", () => {
            if (link.hasAttribute("data-nav-type")) return;

            $$(".nav-link").forEach((item) => {
                item.classList.remove("active");
            });

            link.classList.add("active");
        });
    });
}

/* =========================================================
   INITIALIZE APP
========================================================= */

function initCampusVoice() {
    loadAnnouncements();

    setupFilterListeners();
    setupModalListeners();
    setupAnnouncementForm();
    setupNotificationListeners();
    setupMobileMenu();
    setupGeneralActions();

    renderAnnouncements();
    renderNotifications();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCampusVoice);
} else {
    initCampusVoice();
}
