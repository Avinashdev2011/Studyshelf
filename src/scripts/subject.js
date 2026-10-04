import { app, deleteData, pushData, updateData } from "./firebase.js";
import { deleteDriveFile, uploadDriveFile, getFileTypeDetails } from "./driveApi.js";
import { appState, syncDbData } from "./appstate.js";
import {
  fadeInEffect,
  fadeOutEffect,
  hideElement,
  showElement,
} from "./animation.js";
import {
  hideSections,
  showSectionLoader,
  hideSectionLoader,
  applyEditModeUI,
  showConfirmationPopup,
} from "./index.js";
import { headerIcon, headerTitle } from "./navigation.js";
import { showErrorSection } from "./error.js";
import {
  renderUpcomingSubmissions as dashboardRenderUpcomingSubmissions,
  renderNoticeSlider as dashboardRenderNoticeSlider,
} from "./dashboard.js";
import {
  trackCreateEvent,
  trackDeleteEvent,
  trackEditEvent,
} from "./posthog.js";
import { sendNotification } from "./notification.js";
const DOM = {
  subjectPageSection: document.querySelector(".subject-page-section"),
  noticeSwiper: {
    swiper: new Swiper("#subject-page-swiper", {
      direction: "horizontal",
      slidesPerView: "auto",
      spaceBetween: 30,
      loop: false,
      centeredSlides: true,
      watchOverflow: true,
      breakpoints: {
        768: {
          centeredSlides: false,
        },
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },

      observer: true,
      observeParents: true,
    }),
    wrapper: document.querySelector("#subject-page-swiper .swiper-wrapper"),
    pagination: document.querySelector(".swiper-pagination"),
    prevBtn: document.querySelector(".swiper-button-prev"),
    nextBtn: document.querySelector(".swiper-button-next"),
  },
  editorBtn: {
    addNoticeBtn: document.querySelector(
      ".subject-page-section .add-notice-btn",
    ),
    addCategoryBtn: document.querySelector(".add-category-container-btn"),
    addSubmissionBtn: document.querySelector(".add-submission-btn"),
  },
  warningPopup: {
    popup: document.querySelector(
      ".subject-page-section .warning-popup-wrapper",
    ),
    successBtn: document.querySelector(
      ".subject-page-section .warning-popup-wrapper .success-btn",
    ),
    message: document.querySelector(
      ".subject-page-section .warning-popup-wrapper .message",
    ),
  },
  noticePopup: {
    popup: document.querySelector(
      ".subject-page-section .add-notice-popup-wrapper",
    ),
    popupTitle: document.querySelector(
      ".subject-page-section .add-notice-popup-wrapper .popup-title",
    ),
    closeBtn: document.querySelector(
      ".subject-page-section .add-notice-popup-wrapper .close-popup-btn",
    ),
    successBtn: document.querySelector(
      ".subject-page-section .add-notice-popup-wrapper .success-btn",
    ),
    inputs: {
      title: document.querySelector("#subject-section-notice-title"),
      description: document.querySelector(
        "#subject-section-notice-description",
      ),
      link: document.querySelector("#subject-section-notice-link"),
      file: document.querySelector("#subject-section-notice-file-input"),
    },
    errors: {
      title: document.querySelector(
        ".subject-page-section .add-notice-popup-wrapper .title-error",
      ),
      description: document.querySelector(
        ".subject-page-section .add-notice-popup-wrapper .description-error",
      ),
      link: document.querySelector(
        ".subject-page-section .add-notice-popup-wrapper .link-error",
      ),
      file: document.querySelector(
        ".subject-page-section .add-notice-popup-wrapper .file-error",
      ),
    },
    fileAttachment: {
      icon: document.querySelector(
        ".subject-page-section .add-notice-popup-wrapper .upload-icon",
      ),
      text: document.querySelector(
        ".subject-page-section .add-notice-popup-wrapper .upload-text",
      ),
      inputWrapper: document.querySelector(
        ".subject-page-section .add-notice-popup-wrapper .file-input-wrapper",
      ),
    },
  },
  categoryPopup: {
    popup: document.querySelector(".add-category-popup-wrapper"),
    popupTitle: document.querySelector(
      ".add-category-popup-wrapper .popup-title",
    ),
    closeBtn: document.querySelector(
      ".add-category-popup-wrapper .close-popup-btn",
    ),
    successBtn: document.querySelector(
      ".add-category-popup-wrapper .success-btn",
    ),
    input: document.querySelector("#category-title-input"),
    error: document.querySelector(".add-category-popup-wrapper .title-error"),
  },
  itemPopup: {
    popup: document.querySelector(".add-item-popup-wrapper"),
    popupTitle: document.querySelector(".add-item-popup-wrapper .popup-title"),
    linkInputWrapper: document.querySelector(
      ".add-item-popup-wrapper .link-input-wrapper",
    ),
    closeBtn: document.querySelector(
      ".add-item-popup-wrapper .close-popup-btn",
    ),
    successBtn: document.querySelector(".add-item-popup-wrapper .success-btn"),
    orLine: document.querySelector(".add-item-popup-wrapper .or-line"),
    changeAttachmentBtn: document.querySelector(
      ".add-item-popup-wrapper .change-attachment-btn",
    ),

    editTools: {
      wrapper: document.querySelector(".add-item-popup-wrapper .edit-tools"),
      deleteBtn: document.querySelector(".add-item-popup-wrapper .delete-icon"),
      hideBtn: document.querySelector(".add-item-popup-wrapper .hide-icon"),
      unhideBtn: document.querySelector(".add-item-popup-wrapper .unhide-icon"),
    },

    inputs: {
      title: document.querySelector("#item-title-input"),
      link: document.querySelector("#item-link-input"),
      file: document.querySelector("#item-file-input"),
    },

    errors: {
      title: document.querySelector(".add-item-popup-wrapper .title-error"),
      link: document.querySelector(".add-item-popup-wrapper .link-error"),
      file: document.querySelector(".add-item-popup-wrapper .item-file-error"),
    },

    fileAttachment: {
      icon: document.querySelector(
        ".item-file-attachment-container .upload-icon",
      ),
      text: document.querySelector(
        ".item-file-attachment-container .upload-text",
      ),
      inputWrapper: document.querySelector(".item-file-input-wrapper"),
    },
  },
  submissionPopup: {
    popup: document.querySelector(".add-submission-popup-wrapper"),
    popupTitle: document.querySelector(
      ".add-submission-popup-wrapper .popup-title",
    ),
    dateInputWrapper: document.querySelector(
      ".add-submission-popup-wrapper .date-input-wrapper",
    ),
    closeBtn: document.querySelector(
      ".add-submission-popup-wrapper .close-popup-btn",
    ),
    deleteBtn: document.querySelector(
      ".add-submission-popup-wrapper .delete-btn",
    ),
    successBtn: document.querySelector(
      ".add-submission-popup-wrapper .success-btn",
    ),

    inputs: {
      title: document.querySelector("#submission-title-input"),
      description: document.querySelector("#submission-description-input"),
      date: document.querySelector("#submission-date-input"),
    },

    errors: {
      title: document.querySelector(
        ".add-submission-popup-wrapper .title-error",
      ),
      description: document.querySelector(
        ".add-submission-popup-wrapper .submission-description-error",
      ),
      date: document.querySelector(".add-submission-popup-wrapper .date-error"),
    },

    fakeDatePlaceholder: document.querySelector(
      ".add-submission-popup-wrapper .fake-placeholder",
    ),
  },
  upcomingSubmissions: {
    container: document.querySelector(
      ".subject-page-section .upcoming-submissions",
    ),
    containerTitle: document.querySelector(
      ".subject-page-section .upcoming-submissions .title",
    ),
    addContentBtn: document.querySelector(
      ".subject-page-section .upcoming-submissions .add-content-btn",
    ),
    cardContainer: document.querySelector(
      ".subject-page-section .upcoming-submissions .card-container",
    ),
  },
};
const subjectIcon = document.createElement("img");
subjectIcon.className = "h-full w-full";

export async function loadSubjectSection() {
  try {
    const subjMeta = appState.subjectMetaData?.[appState.activeSubject] || {
      name: appState.activeSubject,
      iconLink: "",
    };
    subjectIcon.src = subjMeta.iconLink || "";
    headerIcon.innerHTML = "";
    headerIcon.classList.remove("bg-primary");
    headerIcon.appendChild(subjectIcon);
    headerTitle.textContent = subjMeta.name || appState.activeSubject;
    await unloadSubjectSection();
    renderNoticeSlider();
    await renderUpcomingSubmissions();
    renderResources();
    await hideSections();
    await applyEditModeUI();
    DOM.noticeSwiper.swiper.slideTo(0, 0);
    DOM.noticeSwiper.swiper.update();
    await fadeInEffect(DOM.subjectPageSection);
  } catch (err) {
    showErrorSection("Error loading subject section", err);
  }
}
async function unloadSubjectSection() {
  await fadeOutEffect(DOM.subjectPageSection);
  document.querySelectorAll(".dynamic-container").forEach((container) => {
    container.remove();
  });
  DOM.noticeSwiper.swiper.removeAllSlides();
  DOM.upcomingSubmissions.cardContainer.innerHTML = "";
}

// notice related function and listener
export function renderNoticeSlider() {
  const noticeEntries =
    appState.divisionData?.noticeData?.subjectNoticeData?.[
      appState.activeSubject
    ];
  if (!noticeEntries || typeof noticeEntries !== "object" || Object.keys(noticeEntries).length === 0) {
    if (DOM.noticeSwiper?.swiper?.el) {
      DOM.noticeSwiper.swiper.el.classList.add("!hidden");
    }
    return;
  }
  const entries = Object.entries(noticeEntries);
  if (!entries || entries.length === 0) {
    if (DOM.noticeSwiper?.swiper?.el) {
      DOM.noticeSwiper.swiper.el.classList.add("!hidden");
    }
    return;
  }
  const reverseEntries = Object.fromEntries([...entries].reverse());
  DOM.noticeSwiper.swiper.el.classList.remove("!hidden");
  for (const key in reverseEntries) {
    const noticeData = reverseEntries[key];
    const swiperSlide = document.createElement("div");
    swiperSlide.className =
      "swiper-slide w-full max-w-[37.5rem] bg-surface-2 !flex !flex-col gap-3 rounded-2xl p-4 lg:p-5";
    const topWrapper = document.createElement("div");
    topWrapper.className = "wrapper flex items-center gap-4  justify-between";

    const iconTitleWrapper = document.createElement("div");
    iconTitleWrapper.className =
      "slide-icon-title-wrapper w-full flex items-center gap-2 lg:gap-3";

    const icon = document.createElement("div");
    icon.className =
      "icon bg-surface-1 flex h-[3rem] w-[3rem] items-center justify-center rounded-full shrink-0";

    const iconInner = document.createElement("i");
    iconInner.className = "ri-file-text-line text-2xl";
    icon.appendChild(iconInner);

    const title = document.createElement("p");
    title.className = "slider-title text-xl font-semibold";
    title.textContent =
      noticeData.title.charAt(0).toUpperCase() + noticeData.title.slice(1);

    iconTitleWrapper.appendChild(icon);
    iconTitleWrapper.appendChild(title);

    topWrapper.appendChild(iconTitleWrapper);

    const createdAt = noticeData.createdAt;
    const now = Date.now();
    const diffInMinutes = (now - createdAt) / (1000 * 60);
    if (diffInMinutes <= 1440) {
      const tag = document.createElement("p");
      tag.className =
        "bg-primary text-on-primary px-2 py-1 w-fit rounded-xl text-xs";
      tag.textContent = "New";
      topWrapper.appendChild(tag);
    }
    const deleteIcon = document.createElement("div");
    deleteIcon.className =
      "delete-icon hidden editor-tool ml-auto flex items-center";
    const deleteIconInner = document.createElement("i");
    deleteIconInner.className =
      "fa-solid fa-trash text-xl cursor-pointer text-text-error";
    deleteIcon.appendChild(deleteIconInner);
    topWrapper.appendChild(deleteIcon);
    const wrapper2 = document.createElement("div");
    wrapper2.className = "wrapper";

    const description = document.createElement("div");
    description.className = "description text-text-secondary line-clamp-5";
    description.innerHTML =
      noticeData.description.charAt(0).toUpperCase() +
      noticeData.description.slice(1).replace(/\n/g, "<br>");

    const linkWrapper = document.createElement("div");
    linkWrapper.className =
      "wrapper text-text-link underline text-sm flex gap-4 pb-4 md:pb-0";

    const readmore = document.createElement("p");
    readmore.className = "cursor-pointer";
    readmore.textContent = "Readmore";
    readmore.style.display = "none";

    const attachment = document.createElement("a");
    attachment.textContent = "See attachment";
    attachment.className = "cursor-pointer hidden";
    attachment.target = "_blank";
    deleteIcon.addEventListener("click", () => {
      deleteNotice(key, noticeData.attachmentId, noticeData.scope);
    });

    if (noticeData.attachmentURL) {
      let rawURL = noticeData.attachmentURL;
      if (!rawURL.startsWith("http")) {
        rawURL = "https://" + rawURL;
      }
      attachment.href = rawURL;
      attachment.classList.remove("hidden");
    }
    linkWrapper.appendChild(readmore);
    linkWrapper.appendChild(attachment);
    wrapper2.appendChild(description);
    wrapper2.appendChild(linkWrapper);
    swiperSlide.appendChild(topWrapper);
    swiperSlide.appendChild(wrapper2);
    DOM.noticeSwiper.swiper.appendSlide(swiperSlide);
    setupReadmoreObserver(description, readmore);
    readmore.addEventListener("click", () => {
      const popup = document.getElementById("readmore-popup");
      const popupTitle = document.getElementById("readmore-popup-title");
      const popupContent = document.getElementById("readmore-popup-content");
      const popupAttachment = document.getElementById("popup-attachment-link");
      popupAttachment;
      popupTitle.textContent = noticeData.title;
      popupContent.textContent = noticeData.description;
      if (noticeData.attachmentURL) {
        popupAttachment.href = noticeData.attachmentURL;
        popupAttachment.target = "_blank";
        popupAttachment.classList.remove("hidden");
      } else {
        popupAttachment.classList.add("hidden");
      }
      fadeInEffect(popup);
    });
  }
}
document
  .getElementById("close-readmore-popup")
  ?.addEventListener("click", () => {
    const element = document.getElementById("readmore-popup");
    fadeOutEffect(element);
  });
function setupReadmoreObserver(description, readmore) {
  const observer = new ResizeObserver((entries) => {
    for (let entry of entries) {
      const target = entry.target;
      if (target.scrollHeight > target.clientHeight) {
        readmore.style.display = "inline";
      }
    }
  });

  observer.observe(description);
}
async function deleteNotice(key, attachmentId) {
  const confirmed = await showConfirmationPopup(
    "The notice will be deleted permenantly",
  );
  if (!confirmed) return;
  try {
    showSectionLoader("Deleting notice...");
    if (attachmentId && attachmentId !== "custom-link") {
      showSectionLoader("Deleting attachment...");
      await deleteDriveFile(attachmentId);
      showSectionLoader("Deleting notice...");
    }
    await deleteData(
      `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/noticeData/subjectNoticeData/${appState.activeSubject}/${key}`,
    );
    trackEditEvent(
      appState.activeSem,
      appState.activeDiv,
      appState.activeSubject,
      "Deleted notice",
    );
    await showSectionLoader("Syncing data...");
    await syncDbData();
    await dashboardRenderUpcomingSubmissions();
    loadSubjectSection();
  } catch (err) {
    console.error("Error deleting notice:", err);
  } finally {
    await hideSectionLoader();
  }
}
function resetAddNoticePopup() {
  DOM.noticePopup.inputs.title.value = "";
  DOM.noticePopup.inputs.description.value = "";
  DOM.noticePopup.inputs.file.value = "";
  DOM.noticePopup.inputs.link.value = "";
  DOM.noticePopup.fileAttachment.text.textContent = "Upload File";
  showElement(DOM.noticePopup.fileAttachment.icon);
  hideElement(DOM.noticePopup.errors.link);
  hideElement(DOM.noticePopup.errors.description);
  hideElement(DOM.noticePopup.errors.title);
  hideElement(DOM.noticePopup.errors.file);
}
DOM.noticePopup.fileAttachment.inputWrapper.addEventListener("click", () => {
  DOM.noticePopup.inputs.file.click();
});
DOM.editorBtn.addNoticeBtn.addEventListener("click", () => {
  fadeInEffect(DOM.noticePopup.popup);
});
DOM.noticePopup.inputs.title.addEventListener("input", () => {
  if (DOM.noticePopup.inputs.title.value.length == 21) {
    DOM.noticePopup.errors.title.textContent = "Max 20 characters reached";

    DOM.noticePopup.inputs.title.value =
      DOM.noticePopup.inputs.title.value.slice(0, 20);
    showElement(DOM.noticePopup.errors.title);
  } else {
    hideElement(DOM.noticePopup.errors.title);
  }
});
DOM.noticePopup.closeBtn.addEventListener("click", async () => {
  await fadeOutEffect(DOM.noticePopup.popup);
  resetAddNoticePopup();
});
DOM.noticePopup.successBtn.addEventListener("click", async () => {
  hideElement(DOM.noticePopup.errors.title);
  hideElement(DOM.noticePopup.errors.description);
  hideElement(DOM.noticePopup.errors.link);
  hideElement(DOM.noticePopup.errors.link);
  hideElement(DOM.noticePopup.errors.file);
  const title = DOM.noticePopup.inputs.title.value.trim();
  const description = DOM.noticePopup.inputs.description.value.trim();
  const file = DOM.noticePopup.inputs.file.files[0];
  const link = DOM.noticePopup.inputs.link.value.trim();
  let isError = false;
  if (!title) {
    DOM.noticePopup.errors.title.textContent = "Title is required";
    showElement(DOM.noticePopup.errors.title);
    isError = true;
  }
  if (!description) {
    DOM.noticePopup.errors.description.textContent = "Description is required";
    showElement(DOM.noticePopup.errors.description);
    isError = true;
  }
  if (!file && link && !/^https?:\/\//.test(link)) {
    DOM.noticePopup.errors.link.textContent = "Enter a valid link";
    showElement(DOM.noticePopup.errors.link);
    isError = true;
  }
  if (file && link) {
    const flag = await showWarningPopup(
      "Please upload either a file or a link, not both.",
    );
    if (flag) {
      await fadeOutEffect(DOM.noticePopup.popup);
      resetAddNoticePopup();
      return;
    }
  }
  if (isError) return;
  let attachmentURL = "";
  let attachmentId = "";
  showSectionLoader("Uploading attachment...");
  if (file) {
    let uploaded = await uploadDriveFile(
      file,
      `${appState.activeSem}/divisionData/division${appState.activeDiv}/noticeData/subjectNoticeData/${appState.activeSubject}`,
    );
    if (!uploaded) {
      hideSectionLoader();
      return;
    }
    attachmentURL = uploaded.webViewLink;
    attachmentId = uploaded.fileId;
  } else if (link) {
    attachmentURL = link;
    attachmentId = "custom-link";
  }
  showSectionLoader("Adding notice...");
  await pushData(
    `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/noticeData/subjectNoticeData/${appState.activeSubject}`,
    {
      title,
      description,
      attachmentURL,
      attachmentId,
      createdAt: Date.now(),
      scope: appState.activeSubject,
    },
  );
  trackEditEvent(
    appState.activeSem,
    appState.activeDiv,
    appState.activeSubject,
    "Added notice",
  );
  await showSectionLoader("Syncing data...");
  await fadeOutEffect(DOM.noticePopup.popup);
  resetAddNoticePopup();
  await syncDbData();
  await dashboardRenderNoticeSlider();
  await loadSubjectSection();
  sendNotification(title, description, "division");
  hideSectionLoader();
});
DOM.noticePopup.inputs.file.addEventListener("change", () => {
  const file = DOM.noticePopup.inputs.file.files[0];
  if (file) {
    if (file.size > 20 * 1024 * 1024) {
      DOM.noticePopup.inputs.file.value = "";
      DOM.noticePopup.errors.file.textContent = "File too large (max 20MB)";
      showElement(DOM.noticePopup.errors.file);
      return;
    }
    hideElement(DOM.noticePopup.fileAttachment.icon);
    DOM.noticePopup.fileAttachment.text.textContent = "1 file attached";
  } else {
    showElement(DOM.noticePopup.fileAttachment.icon);
    DOM.noticePopup.fileAttachment.text.textContent = "Upload File";
  }
});
function showWarningPopup(message) {
  return new Promise((resolve) => {
    // DOM.warningPopup.message.textContent = message;
    fadeInEffect(DOM.warningPopup.popup);
    DOM.warningPopup.successBtn.addEventListener("click", async () => {
      await fadeOutEffect(DOM.warningPopup.popup);
      resolve(true);
    });
  });
}

// add category related function and listener
let isCategoryEditing = false;
let selectedCategoryId = null;
DOM.editorBtn.addCategoryBtn.addEventListener("click", () => {
  fadeInEffect(DOM.categoryPopup.popup);
});
DOM.categoryPopup.successBtn.addEventListener("click", async () => {
  hideElement(DOM.categoryPopup.error);
  const title = DOM.categoryPopup.input.value.trim();
  if (!title) {
    DOM.categoryPopup.error.textContent = "Title is required";
    showElement(DOM.categoryPopup.error);
    return;
  }
  if (isCategoryEditing) {
    await showSectionLoader("Updating category...");
    updateData(
      `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/subjectList/${appState.activeSubject}/containerList/${selectedCategoryId}/metaData`,
      { name: title },
    );
    trackEditEvent(
      appState.activeSem,
      appState.activeDiv,
      appState.activeSubject,
      "Edited category name to:" + title,
    );
  } else {
    showSectionLoader("Adding category...");
    await pushData(
      `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/subjectList/${appState.activeSubject}/containerList`,
      { metaData: { name: title, isVisible: true } },
    );
    trackCreateEvent(
      appState.activeSem,
      appState.activeDiv,
      appState.activeSubject,
      "Added category:" + title,
    );
  }
  await fadeOutEffect(DOM.categoryPopup.popup);
  showSectionLoader("Syncing data...");
  resetAddCategoryPopup();
  await syncDbData();
  await loadSubjectSection();
  hideSectionLoader();
});
DOM.categoryPopup.input.addEventListener("input", () => {
  if (DOM.categoryPopup.input.value.length == 21) {
    DOM.categoryPopup.error.textContent = "Max 20 characters reached";
    DOM.categoryPopup.input.value = DOM.categoryPopup.input.value.slice(0, 20);
    showElement(DOM.categoryPopup.error);
  } else {
    hideElement(DOM.categoryPopup.error);
  }
});
DOM.categoryPopup.closeBtn.addEventListener("click", async () => {
  await fadeOutEffect(DOM.categoryPopup.popup);
  resetAddCategoryPopup();
});
async function deleteCategory() {
  const confirm = await showConfirmationPopup(
    "All the content in this category will be deleted forever",
  );
  if (!confirm) return;
  showSectionLoader("Deleting category...");
  const data =
    appState.subjectData[appState.activeSubject].containerList[
      selectedCategoryId
    ];
  showSectionLoader("Deleting individual content...");
  for (const key in data.itemList) {
    const element = data.itemList[key];
    if (element.attachmentId === "custom-link") continue;
    await deleteDriveFile(element.attachmentId);
  }
  showSectionLoader("Deleting category...");
  await deleteData(
    `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/subjectList/${appState.activeSubject}/containerList/${selectedCategoryId}`,
  );
  trackDeleteEvent(
    appState.activeSem,
    appState.activeDiv,
    appState.activeSubject,
    "Deleted category:" + data.metaData.name,
  );
  await showSectionLoader("Syncing data...");
  await syncDbData();
  await loadSubjectSection();
  hideSectionLoader();
}
function resetAddCategoryPopup() {
  showElement(DOM.categoryPopup.successBtn);
  hideElement(DOM.categoryPopup.error);
  DOM.categoryPopup.input.value = "";
  DOM.categoryPopup.successBtn.textContent = "Create";
  DOM.categoryPopup.popupTitle.textContent = "Add Category";
  isCategoryEditing = false;
  selectedCategoryId = null;
}
function editCategory() {
  DOM.categoryPopup.input.value =
    appState.subjectData[appState.activeSubject].containerList[
      selectedCategoryId
    ].metaData.name;
  isCategoryEditing = true;
  DOM.categoryPopup.successBtn.textContent = "Edit";
  DOM.categoryPopup.popupTitle.textContent = "Edit Category";

  fadeInEffect(DOM.categoryPopup.popup);
}
async function toggleCategoryVisibility() {
  const confirm = await showConfirmationPopup(
    "All the content in this category will not be visible to students until you unhide it",
  );
  if (!confirm) return;
  await showSectionLoader("Changing visibility...");
  await updateData(
    `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/subjectList/${appState.activeSubject}/containerList/${selectedCategoryId}/metaData`,
    {
      isVisible:
        !appState.subjectData[appState.activeSubject].containerList[
          selectedCategoryId
        ].metaData.isVisible,
    },
  );
  await showSectionLoader("Syncing data...");
  await syncDbData();
  await loadSubjectSection();
  hideSectionLoader();
}

// individual item related function and listener
let isItemEditing = false;
let selectedItemId = null;
let originalLink = "";
let originalAttachmentId = "";
function resetAddItemPopup() {
  showElement(DOM.itemPopup.linkInputWrapper);
  showElement(DOM.itemPopup.fileAttachment.icon);
  showElement(DOM.itemPopup.fileAttachment.inputWrapper);
  showElement(DOM.itemPopup.orLine);
  hideElement(DOM.itemPopup.errors.title);
  hideElement(DOM.itemPopup.errors.file);
  hideElement(DOM.itemPopup.errors.link);
  hideElement(DOM.itemPopup.changeAttachmentBtn);
  hideElement(DOM.itemPopup.editTools.wrapper);
  DOM.itemPopup.inputs.title.value = "";
  DOM.itemPopup.inputs.link.value = "";
  DOM.itemPopup.inputs.file.value = "";
  DOM.itemPopup.successBtn.textContent = "Create";
  DOM.itemPopup.fileAttachment.text.textContent = "Upload File";
  DOM.itemPopup.popupTitle.textContent = "Add Item";
  originalAttachmentId = "";
  originalLink = "";
  isItemEditing = false;
  selectedItemId = null;
}
function editItem(itemId, categoryId, link, attachmentId, title, visible) {
  selectedItemId = itemId;
  selectedCategoryId = categoryId;
  originalLink = link;
  originalAttachmentId = attachmentId || "custom-link";
  isItemEditing = true;
  hideElement(DOM.itemPopup.linkInputWrapper);
  showElement(DOM.itemPopup.editTools.wrapper);
  showElement(DOM.itemPopup.changeAttachmentBtn);
  hideElement(DOM.itemPopup.editTools.unhideBtn);
  showElement(DOM.itemPopup.editTools.hideBtn);
  hideElement(DOM.itemPopup.fileAttachment.inputWrapper);
  hideElement(DOM.itemPopup.orLine);
  DOM.itemPopup.inputs.title.value = title;
  DOM.itemPopup.inputs.link.value = link;
  DOM.itemPopup.inputs.file.value = "";
  DOM.itemPopup.popupTitle.textContent = "Edit Item";
  DOM.itemPopup.successBtn.textContent = "Edit";
  if (visible === false) {
    showElement(DOM.itemPopup.editTools.unhideBtn);
    hideElement(DOM.itemPopup.editTools.hideBtn);
  } else {
    hideElement(DOM.itemPopup.editTools.unhideBtn);
    showElement(DOM.itemPopup.editTools.hideBtn);
  }
  fadeInEffect(DOM.itemPopup.popup);
}
DOM.itemPopup.changeAttachmentBtn.addEventListener("click", () => {
  DOM.itemPopup.inputs.link.value = "";
  showElement(DOM.itemPopup.successBtn);
  showElement(DOM.itemPopup.fileAttachment.inputWrapper);
  showElement(DOM.itemPopup.linkInputWrapper);
  showElement(DOM.itemPopup.orLine);
  hideElement(DOM.itemPopup.changeAttachmentBtn);
});
DOM.itemPopup.fileAttachment.inputWrapper.addEventListener("click", () => {
  DOM.itemPopup.inputs.file.click();
});
DOM.itemPopup.closeBtn.addEventListener("click", async () => {
  await fadeOutEffect(DOM.itemPopup.popup);
  resetAddItemPopup();
});
DOM.itemPopup.inputs.file.addEventListener("change", () => {
  const file = DOM.itemPopup.inputs.file.files[0];
  if (file) {
    if (file.size > 20 * 1024 * 1024) {
      DOM.itemPopup.inputs.file.value = "";
      DOM.itemPopup.errors.file.textContent = "File too large (max 20MB)";
      showElement(DOM.itemPopup.errors.file);
      return;
    }
    hideElement(DOM.itemPopup.fileAttachment.icon);
    DOM.itemPopup.fileAttachment.text.textContent = file.name;
    if (!DOM.itemPopup.inputs.title.value.trim()) {
      DOM.itemPopup.inputs.title.value = file.name.replace(/\.[^/.]+$/, "");
    }
  } else {
    showElement(DOM.itemPopup.fileAttachment.icon);
    DOM.itemPopup.fileAttachment.text.textContent = "Upload File";
  }
});
DOM.itemPopup.successBtn.addEventListener("click", async () => {
  hideElement(DOM.itemPopup.errors.link);
  hideElement(DOM.itemPopup.errors.title);
  hideElement(DOM.itemPopup.errors.file);
  const title = DOM.itemPopup.inputs.title.value.trim();
  const link = DOM.itemPopup.inputs.link.value.trim();
  const file = DOM.itemPopup.inputs.file.files[0];
  let isError = false;
  if (!title) {
    DOM.itemPopup.errors.title.textContent = "Title is required";
    showElement(DOM.itemPopup.errors.title);
    isError = true;
  }
  if (!link && !file) {
    DOM.itemPopup.errors.link.textContent = "Link or file is required";
    showElement(DOM.itemPopup.errors.link);
    isError = true;
  }
  if (file && link) {
    let flag = await showWarningPopup("Please upload either a file or a link.");
    await fadeOutEffect(DOM.itemPopup.popup);
    resetAddItemPopup();
    return;
  }
  if (link && !/^https?:\/\//.test(link)) {
    DOM.itemPopup.errors.link.textContent = "Enter a valid link ";
    showElement(DOM.itemPopup.errors.link);
    isError = true;
  }
  if (isError) return;
  let attachmentURL = "";
  let attachmentId = "";
  let originalFileName = "";
  let fileExtension = "";
  try {
    if (file) {
      showSectionLoader("Uploading file...");
      let uploaded = null;
      try {
        uploaded = await uploadDriveFile(
          file,
          `subjects/${appState.activeSubject}/${selectedCategoryId}`,
        );
      } catch (err) {
        console.error("Upload error:", err);
      }
      if (!uploaded) {
        return;
      }
      attachmentURL = uploaded.webViewLink;
      attachmentId = uploaded.fileId;
      originalFileName = uploaded.fileName || file.name || "";
      fileExtension =
        uploaded.fileType ||
        (originalFileName.includes(".")
          ? originalFileName.split(".").pop().toLowerCase()
          : "");
    } else {
      attachmentURL = link;
      if (link !== originalLink) {
        attachmentId = "custom-link";
      } else {
        attachmentId = originalAttachmentId;
      }
    }
    if (isItemEditing) {
      if (originalAttachmentId !== attachmentId && originalAttachmentId && originalAttachmentId !== "custom-link") {
        showSectionLoader("Deleting old file...");
        try { await deleteDriveFile(originalAttachmentId); } catch (e) {}
      }
      showSectionLoader("Updating item...");
      const updatePayload = {
        name: title,
        link: attachmentURL,
        attachmentId,
      };
      if (file) {
        updatePayload.fileName = originalFileName;
        updatePayload.fileType = fileExtension;
      }
      await updateData(
        `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/subjectList/${appState.activeSubject}/containerList/${selectedCategoryId}/itemList/${selectedItemId}`,
        updatePayload,
      );
      trackEditEvent(
        appState.activeSem,
        appState.activeDiv,
        appState.activeSubject,
        "Updated item:" + title,
      );
    } else {
      showSectionLoader("Adding item...");
      const newItemPayload = {
        name: title,
        link: attachmentURL,
        attachmentId,
        createdAt: Date.now(),
        isVisible: true,
      };
      if (file) {
        newItemPayload.fileName = originalFileName;
        newItemPayload.fileType = fileExtension;
      }
      await pushData(
        `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/subjectList/${appState.activeSubject}/containerList/${selectedCategoryId}/itemList`,
        newItemPayload,
      );
      trackCreateEvent(
        appState.activeSem,
        appState.activeDiv,
        appState.activeSubject,
        "Added item:" + title,
      );
    }
    await showSectionLoader("Syncing data...");
    await fadeOutEffect(DOM.itemPopup.popup);
    await syncDbData();
    resetAddItemPopup();
    await loadSubjectSection();
    sendNotification(appState.activeSubject, `${title} added`, "division");
  } catch (err) {
    console.error("Error in addItem handler:", err);
  } finally {
    hideSectionLoader();
  }
});
DOM.itemPopup.editTools.unhideBtn.addEventListener("click", async () => {
  try {
    const title =
      `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/subjectList/${appState.activeSubject}/containerList/${selectedCategoryId}/itemList/${selectedItemId}`
        .name;
    let confirm = await showConfirmationPopup(
      "Are you sure you want to unhide this item?",
    );
    if (!confirm) return;
    showSectionLoader("Unhiding item...");
    await updateData(
      `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/subjectList/${appState.activeSubject}/containerList/${selectedCategoryId}/itemList/${selectedItemId}`,
      { isVisible: true },
    );
    await showSectionLoader("Syncing data...");
    await fadeOutEffect(DOM.itemPopup.popup);
    await syncDbData();
    trackEditEvent(
      appState.activeSem,
      appState.activeDiv,
      appState.activeSubject,
      "Unhide item:" + title,
    );
    resetAddItemPopup();
    await loadSubjectSection();
    hideSectionLoader();
  } catch (err) {
    showErrorSection("Error unhiding item", err);
  }
});
DOM.itemPopup.editTools.hideBtn.addEventListener("click", async () => {
  const title =
    `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/subjectList/${appState.activeSubject}/containerList/${selectedCategoryId}/itemList/${selectedItemId}`
      .name;
  let confirm = await showConfirmationPopup(
    "Are you sure you want to hide this item?",
  );
  if (!confirm) return;
  showSectionLoader("Hiding item...");
  await updateData(
    `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/subjectList/${appState.activeSubject}/containerList/${selectedCategoryId}/itemList/${selectedItemId}`,
    { isVisible: false },
  );
  await showSectionLoader("Syncing data...");
  await fadeOutEffect(DOM.itemPopup.popup);
  trackEditEvent(
    appState.activeSem,
    appState.activeDiv,
    appState.activeSubject,
    "Hide item:" + title,
  );

  await syncDbData();
  resetAddItemPopup();
  await loadSubjectSection();
  hideSectionLoader();
});
DOM.itemPopup.inputs.title.addEventListener("input", () => {
  if (DOM.itemPopup.inputs.title.value.length == 13) {
    DOM.itemPopup.inputs.title.value = DOM.itemPopup.inputs.title.value.slice(
      0,
      12,
    );
    DOM.itemPopup.errors.title.textContent =
      "Max 12 characters reached (Use short words like Exp, Asign, etc)";
    showElement(DOM.itemPopup.errors.title);
  } else {
    hideElement(DOM.itemPopup.errors.title);
  }
});
DOM.itemPopup.editTools.deleteBtn.addEventListener("click", async () => {
  let confirm = await showConfirmationPopup(
    "Are you sure you want to delete this item?",
  );
  if (!confirm) return;
  try {
    const itemData =
      appState.subjectData?.[appState.activeSubject]?.containerList?.[
        selectedCategoryId
      ]?.itemList?.[selectedItemId];
    const name = itemData?.name || "item";
    const attachmentId = itemData?.attachmentId || originalAttachmentId;

    if (attachmentId && attachmentId !== "custom-link") {
      showSectionLoader("Deleting uploaded attachment...");
      try {
        await deleteDriveFile(attachmentId);
      } catch (e) {
        console.warn("Could not delete attachment file:", e);
      }
    }
    showSectionLoader("Deleting item...");
    await deleteData(
      `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/subjectList/${appState.activeSubject}/containerList/${selectedCategoryId}/itemList/${selectedItemId}`,
    );
    await showSectionLoader("Syncing data...");
    await fadeOutEffect(DOM.itemPopup.popup);
    trackDeleteEvent(
      appState.activeSem,
      appState.activeDiv,
      appState.activeSubject,
      "Deleted item:" + name,
    );
    await syncDbData();
    resetAddItemPopup();
    await loadSubjectSection();
  } catch (err) {
    console.error("Error deleting item:", err);
  } finally {
    hideSectionLoader();
  }
});
function renderResources() {
  const rawCategory =
    appState.subjectData?.[appState.activeSubject]?.containerList;
  if (!rawCategory || typeof rawCategory !== "object" || Object.keys(rawCategory).length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className =
      "dynamic-container flex flex-col items-center justify-center gap-3 p-8 rounded-2xl bg-surface-2/40 border border-surface-2 text-center my-4";
    
    const isAdminOrEditor =
      appState.role === "admin" ||
      appState.role === "teacher" ||
      appState.role === "editor" ||
      appState.isEditing;

    emptyState.innerHTML = `
      <div class="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center text-text-secondary text-xl">
        <i class="fa-solid fa-folder-open"></i>
      </div>
      <div>
        <p class="font-semibold text-text-primary">${isAdminOrEditor ? "No sections added yet" : "No study materials available"}</p>
        ${
          isAdminOrEditor
            ? '<p class="text-sm text-text-secondary mt-0.5">Click <strong>Edit</strong> in the top header, then <strong>+ Add Container</strong> to create sections and add PDFs, PPTs, or DOC files.</p>'
            : '<p class="text-sm text-text-secondary mt-0.5">Study materials for this subject will appear here once uploaded.</p>'
        }
      </div>
    `;
    DOM.subjectPageSection.appendChild(emptyState);
    return;
  }

  const categoryData = Object.fromEntries(
    Object.entries(rawCategory).reverse(),
  );

  for (const categoryId in categoryData) {
    const category = categoryData[categoryId];
    const container = document.createElement("div");
    container.className =
      "category-item-container dynamic-container gap-2 lg:gap-3 flex flex-col w-full";

    const headingWrapper = document.createElement("div");
    headingWrapper.className = "gap-2 lg:gap-3 flex items-center w-full";
    const heading = document.createElement("p");
    heading.textContent =
      category.metaData.name.charAt(0).toUpperCase() +
      category.metaData.name.slice(1);
    const plusIcon = document.createElement("div");
    plusIcon.className = "plus-icon hidden editor-tool";
    const plusIconInner = document.createElement("i");
    plusIconInner.className = "fa-solid fa-plus text-2xl cursor-pointer";
    plusIcon.appendChild(plusIconInner);
    const editIcon = document.createElement("div");
    editIcon.className = "edit-icon hidden editor-tool ml-auto";
    const editIconInner = document.createElement("i");
    editIconInner.className = "fa-solid fa-pen text-xl cursor-pointer ml-auto";
    editIcon.appendChild(editIconInner);
    const deleteIcon = document.createElement("div");
    deleteIcon.className = "delete-icon hidden editor-tool";
    const deleteIconInner = document.createElement("i");
    deleteIconInner.className =
      "fa-solid fa-trash text-xl cursor-pointer text-text-error";
    deleteIcon.appendChild(deleteIconInner);
    const visibilityIcon = document.createElement("div");
    visibilityIcon.className = "visibility-icon hidden editor-tool";
    const visibilityIconInner = document.createElement("i");
    visibilityIconInner.className = category.metaData.isVisible
      ? "fa-solid fa-eye-slash text-xl cursor-pointer"
      : "fa-solid fa-eye text-xl cursor-pointer";
    visibilityIcon.appendChild(visibilityIconInner);
    headingWrapper.appendChild(heading);
    headingWrapper.appendChild(plusIcon);
    headingWrapper.appendChild(editIcon);
    headingWrapper.appendChild(visibilityIcon);
    headingWrapper.appendChild(deleteIcon);
    container.appendChild(headingWrapper);
    const cardContainer = document.createElement("div");
    if (!category.metaData.isVisible) {
      container.classList.add("editor-only-content");
      container.classList.add("hidden");
      heading.className = "text-2xl font-semibold opacity-50";
      cardContainer.className = "card-wrapper grid-auto-fit opacity-50";
    } else {
      cardContainer.className = "card-wrapper grid-auto-fit";
      heading.className = "text-2xl font-semibold";
    }
    plusIcon.addEventListener("click", () => {
      selectedCategoryId = categoryId;
      fadeInEffect(DOM.itemPopup.popup);
    });
    deleteIcon.addEventListener("click", () => {
      selectedCategoryId = categoryId;
      deleteCategory();
    });
    editIcon.addEventListener("click", () => {
      selectedCategoryId = categoryId;
      editCategory();
    });
    visibilityIcon.addEventListener("click", () => {
      selectedCategoryId = categoryId;
      toggleCategoryVisibility();
    });

    const items = category?.itemList || {};
    for (const itemId in items) {
      const item = items[itemId];
      const link = document.createElement("a");
      link.href = item.link;
      link.target = "_blank";
      link.className = "w-full";
      const card = document.createElement("div");
      const isVisibleClass = item.isVisible
        ? "custom-hover"
        : "editor-only-content-card opacity-50";
      card.className = `card p-3.5 px-4 w-full bg-surface-2 rounded-2xl flex items-center justify-between gap-3 ${isVisibleClass}`;
      if (!item.isVisible) {
        link.classList.add("hidden");
      }

      const { fileIcon, badgeBg, badgeLabel } = getFileTypeDetails(item);

      card.innerHTML = `
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <div class="w-8 h-8 rounded-lg bg-surface-1 shrink-0 flex items-center justify-center">
            <i class="${fileIcon} text-lg"></i>
          </div>
          <span class="break-words break-all font-medium text-text-primary text-sm leading-snug">${item.name}</span>
        </div>
        <span class="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full shrink-0 ${badgeBg}">${badgeLabel}</span>
      `;

      link.appendChild(card);
      cardContainer.appendChild(link);

      // listner
      card.addEventListener("click", (e) => {
        if (appState.isEditing) {
          e.preventDefault();
          editItem(
            itemId,
            categoryId,
            item.link,
            item.attachmentId,
            item.name,
            item.isVisible,
          );
        }
      });
    }
    container.appendChild(cardContainer);
    DOM.subjectPageSection.appendChild(container);
  }
}
// upcoming submission related function and listener
let isSubmissionEditing = false;
let selectedSubmissionId = null;
DOM.upcomingSubmissions.addContentBtn.addEventListener("click", () => {
  fadeInEffect(DOM.submissionPopup.popup);
});
DOM.submissionPopup.closeBtn.addEventListener("click", async () => {
  await fadeOutEffect(DOM.submissionPopup.popup);
  resetAddUpcomingSubmissionPopup();
});
DOM.submissionPopup.inputs.date.addEventListener("click", () => {
  if (DOM.submissionPopup.inputs.date.showPicker) {
    DOM.submissionPopup.inputs.date.showPicker();
  } else {
    DOM.submissionPopup.inputs.date.focus();
  }
});
DOM.submissionPopup.inputs.date.addEventListener("input", () => {
  hideElement(DOM.submissionPopup.fakeDatePlaceholder);
});
DOM.submissionPopup.successBtn.addEventListener("click", async () => {
  hideElement(DOM.submissionPopup.errors.title);
  let title = DOM.submissionPopup.inputs.title.value;
  let date = DOM.submissionPopup.inputs.date.value;
  let isError = false;
  if (!title) {
    isError = true;
    DOM.submissionPopup.errors.title.textContent = "Required";
    showElement(DOM.submissionPopup.errors.title);
  }
  if (!date) {
    isError = true;
    DOM.submissionPopup.errors.date.textContent = "Required";
    showElement(DOM.submissionPopup.errors.date);
  }
  if (isError) return;
  if (isSubmissionEditing) {
    showSectionLoader("Updating submission...");
    await updateData(
      `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/upcomingSubmissionData/${appState.activeSubject}/${selectedSubmissionId}`,
      {
        name: title,
        dueDate: date,
      },
    );
    trackEditEvent(
      appState.activeSem,
      appState.activeDiv,
      appState.activeSem,
      appState.activeDiv,
      appState.activeSubject,
      "Edited submission:" + title,
    );
  } else {
    showSectionLoader("Creating submission...");
    await pushData(
      `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/upcomingSubmissionData/${appState.activeSubject}`,
      {
        name: title,
        dueDate: date,
      },
    );
    trackCreateEvent(
      appState.activeSem,
      appState.activeDiv,
      appState.activeSubject,
      "Created submission:" + title,
    );
  }
  await showSectionLoader("Syncing data...");
  await fadeOutEffect(DOM.submissionPopup.popup);
  await syncDbData();
  resetAddUpcomingSubmissionPopup();
  await dashboardRenderUpcomingSubmissions();
  await loadSubjectSection();
  sendNotification(
    appState.activeSubject,
    `${title} submission on ${formatDateBasedOnProximity(date)}`,
    "division",
  );

  hideSectionLoader();
});
DOM.submissionPopup.deleteBtn.addEventListener("click", async () => {
  const confirm = await showConfirmationPopup(
    "All the content in this category will be deleted forever",
  );
  if (!confirm) return;
  showSectionLoader("Deleting submission...");
  await deleteData(
    `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/upcomingSubmissionData/${appState.activeSubject}/${selectedSubmissionId}`,
  );
  await showSectionLoader("Syncing data...");
  await fadeOutEffect(DOM.submissionPopup.popup);
  trackDeleteEvent(
    appState.activeSem,
    appState.activeDiv,
    appState.activeSubject,
    "Deleted submission:" + selectedSubmissionId,
  );
  await syncDbData();
  resetAddUpcomingSubmissionPopup();
  await dashboardRenderUpcomingSubmissions();
  await loadSubjectSection();
  hideSectionLoader();
});
DOM.submissionPopup.inputs.title.addEventListener("input", () => {
  if (DOM.submissionPopup.inputs.title.value.length == 13) {
    DOM.submissionPopup.errors.title.textContent =
      "Max 12 characters reached (Use short words like Exp, Asign, etc)";
    DOM.submissionPopup.inputs.title.value =
      DOM.submissionPopup.inputs.title.value.slice(0, 12);
    showElement(DOM.submissionPopup.errors.title);
  } else {
    hideElement(DOM.submissionPopup.errors.title);
  }
});

function resetAddUpcomingSubmissionPopup() {
  showElement(DOM.submissionPopup.dateInputWrapper);
  showElement(DOM.submissionPopup.fakeDatePlaceholder);
  hideElement(DOM.submissionPopup.deleteBtn);
  DOM.submissionPopup.inputs.title.value = "";
  DOM.submissionPopup.inputs.date.value = "";
  isSubmissionEditing = false;
  selectedSubmissionId = null;
  DOM.submissionPopup.popupTitle.textContent = "Add Submission";
  DOM.submissionPopup.successBtn.textContent = "Create";
}
function editUpcomingSubmission(submissionId) {
  DOM.submissionPopup.successBtn.textContent = "Edit";
  DOM.submissionPopup.inputs.title.value =
    appState.divisionData.upcomingSubmissionData[appState.activeSubject][
      submissionId
    ].name;
  DOM.submissionPopup.inputs.date.value =
    appState.divisionData.upcomingSubmissionData[appState.activeSubject][
      submissionId
    ].dueDate;
  hideElement(DOM.submissionPopup.fakeDatePlaceholder);
  isSubmissionEditing = true;
  selectedSubmissionId = submissionId;
  DOM.submissionPopup.popupTitle.textContent = "Edit Submission";
  showElement(DOM.submissionPopup.deleteBtn);
  fadeInEffect(DOM.submissionPopup.popup);
}
async function renderUpcomingSubmissions() {
  if (appState?.userData?.role === "admin") {
    hideElement(DOM.upcomingSubmissions.container);
    return;
  }
  const submissionData =
    (appState.divisionData?.upcomingSubmissionData || {})[
      appState.activeSubject
    ] || {};
  const sortedSubmissionData = sortSubmissionsByDateObj(submissionData);
  if (!sortedSubmissionData || !Object.keys(sortedSubmissionData).length) {
    hideElement(DOM.upcomingSubmissions.container);
    return;
  }
  showElement(DOM.upcomingSubmissions.container);
  const now = new Date();
  const deleteCutoffHour = 17;
  const deleteCutoffMinute = 30;
  for (const key in sortedSubmissionData) {
    let submission = sortedSubmissionData[key];
    if (
      typeof submission.dueDate === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(submission.dueDate)
    ) {
      const [year, month, day] = submission.dueDate.split("-").map(Number);
      const deleteTime = new Date(
        year,
        month - 1,
        day,
        deleteCutoffHour,
        deleteCutoffMinute,
      );
      if (now > deleteTime && appState.userData.role !== "student") {
        await deleteData(
          `semesterList/${appState.activeSem}/divisionList/${appState.activeDiv}/upcomingSubmissionData/${appState.activeSubject}/${key}`,
        );
        delete submissionData[key];
        continue;
      }
    }
    const card = document.createElement("div");
    card.className = "card p-4 bg-surface-2 rounded-[1.25rem] text-center";
    const description = document.createElement("p");
    description.className = "description";
    description.textContent =
      submission.name.charAt(0).toUpperCase() + submission.name.slice(1);
    const submissionDate = document.createElement("p");
    submissionDate.className = "submission-date";
    submissionDate.textContent = formatDateBasedOnProximity(submission.dueDate);
    card.appendChild(description);
    card.appendChild(submissionDate);
    DOM.upcomingSubmissions.cardContainer.appendChild(card);
    card.addEventListener("click", () => {
      if (appState.isEditing) {
        editUpcomingSubmission(key);
      }
    });
  }
}
function formatDateBasedOnProximity(rawDate) {
  const dateObj = new Date(rawDate);
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const dateStr = dateObj.toISOString().split("T")[0];

  if (dateStr === todayStr) {
    return "Today";
  }

  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(now.getDate() + 7);

  const day = dateObj.getDate().toString().padStart(2, "0");

  if (dateObj <= sevenDaysLater) {
    // Format: DD-Wed (within next 7 days)
    const weekday = dateObj.toLocaleDateString("en-US", {
      weekday: "short",
    });
    return `${day}-${weekday}`;
  } else {
    // Format: DD-Aug (more than 7 days away)
    const month = dateObj.toLocaleDateString("en-US", {
      month: "short",
    });
    return `${day}-${month}`;
  }
}
function sortSubmissionsByDateObj(submissionData) {
  return Object.fromEntries(
    Object.entries(submissionData).sort(([, a], [, b]) => {
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      return dateA - dateB; // ascending
    }),
  );
}
