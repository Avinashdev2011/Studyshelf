import { app, deleteData, pushData, updateData } from "./firebase.js";
import { deleteDriveFile, uploadDriveFile } from "./driveApi.js";
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
  showConfirmationPopup,
} from "./index.js";
import { headerIcon, headerTitle } from "./navigation.js";
import { showErrorSection } from "./error.js";
import {
  trackCreateEvent,
  trackDeleteEvent,
  trackEditEvent,
} from "./posthog.js";
import { editModeToggleButton } from "./index.js";
const DOM = {
  personalFolderSection: document.querySelector(
    ".personal-folder-page-section",
  ),
  editorBtn: {
    editBtn: document.querySelector(".personal-folder-edit-mode-toggle-btn"),
    addCategoryBtn: document.querySelector(
      ".personal-folder-page-section .add-category-container-btn",
    ),
  },
  warningPopup: {
    popup: document.querySelector(
      ".personal-folder-page-section .warning-popup-wrapper",
    ),
    successBtn: document.querySelector(
      ".personal-folder-page-section .warning-popup-wrapper .success-btn",
    ),
    message: document.querySelector(
      ".personal-folder-page-section .warning-popup-wrapper .message",
    ),
  },
  categoryPopup: {
    popup: document.querySelector(
      " .personal-folder-page-section .add-category-popup-wrapper",
    ),
    popupTitle: document.querySelector(
      ".personal-folder-page-section .add-category-popup-wrapper .popup-title",
    ),
    closeBtn: document.querySelector(
      ".personal-folder-page-section .add-category-popup-wrapper .close-popup-btn",
    ),
    successBtn: document.querySelector(
      ".personal-folder-page-section .add-category-popup-wrapper .success-btn",
    ),
    input: document.querySelector("#personal-folder-category-title-input"),
    error: document.querySelector(
      ".personal-folder-page-section .add-category-popup-wrapper .title-error",
    ),
  },
  itemPopup: {
    popup: document.querySelector(
      " .personal-folder-page-section .add-item-popup-wrapper",
    ),
    popupTitle: document.querySelector(
      ".personal-folder-page-section .add-item-popup-wrapper .popup-title",
    ),
    linkInputWrapper: document.querySelector(
      ".personal-folder-page-section .add-item-popup-wrapper .link-input-wrapper",
    ),
    closeBtn: document.querySelector(
      ".personal-folder-page-section .add-item-popup-wrapper .close-popup-btn",
    ),
    successBtn: document.querySelector(
      ".personal-folder-page-section .add-item-popup-wrapper .success-btn",
    ),
    orLine: document.querySelector(
      ".personal-folder-page-section .add-item-popup-wrapper .or-line",
    ),
    changeAttachmentBtn: document.querySelector(
      ".personal-folder-page-section .add-item-popup-wrapper .change-attachment-btn",
    ),

    editTools: {
      wrapper: document.querySelector(
        ".personal-folder-page-section .add-item-popup-wrapper .edit-tools",
      ),
      deleteBtn: document.querySelector(
        ".personal-folder-page-section .add-item-popup-wrapper .delete-icon",
      ),
      hideBtn: document.querySelector(
        ".personal-folder-page-section .add-item-popup-wrapper .hide-icon",
      ),
      unhideBtn: document.querySelector(
        ".personal-folder-page-section .add-item-popup-wrapper .unhide-icon",
      ),
    },

    inputs: {
      title: document.querySelector("#personal-folder-item-title-input"),
      link: document.querySelector("#personal-folder-item-link-input"),
      file: document.querySelector("#personal-folder-item-file-input"),
    },

    errors: {
      title: document.querySelector(
        " .personal-folder-page-section .add-item-popup-wrapper .title-error",
      ),
      link: document.querySelector(
        ".personal-folder-page-section .add-item-popup-wrapper .link-error",
      ),
      file: document.querySelector(
        ".personal-folder-page-section .add-item-popup-wrapper .item-file-error",
      ),
    },

    fileAttachment: {
      icon: document.querySelector(
        " .personal-folder-page-section .item-file-attachment-container .upload-icon",
      ),
      text: document.querySelector(
        ".personal-folder-page-section .item-file-attachment-container .upload-text",
      ),
      inputWrapper: document.querySelector(
        ".personal-folder-page-section .item-file-input-wrapper",
      ),
    },
  },
};
export async function loadPersonalFolderSection() {
  try {
    headerIcon.classList.add("bg-primary");

    headerIcon.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder-icon lucide-folder"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
`;

    headerTitle.textContent = "Personal Folder";
    await unloadPersonalFolderSection();
    renderResources();
    await hideSections();
    hideElement(editModeToggleButton);
    showElement(DOM.editorBtn.editBtn);
    await applyEditModeUI();

    await fadeInEffect(DOM.personalFolderSection);
  } catch (err) {
    showErrorSection("Error loading personal folder section", err);
  }
}
async function unloadPersonalFolderSection() {
  await fadeOutEffect(DOM.personalFolderSection);
  document.querySelectorAll(".dynamic-container").forEach((container) => {
    container.remove();
  });
  hideElement(DOM.editorBtn.editBtn);
  if (appState.role !== "student") {
    showElement(editModeToggleButton);
  }
}

// edit state function
let personalFolderIsEditing = false;
async function applyEditModeUI() {
  const editorTool = DOM.personalFolderSection.querySelectorAll(".editor-tool");
  const editorOnlyContent = DOM.personalFolderSection.querySelectorAll(
    ".editor-only-content",
  );
  const editorOnlyContentCard = DOM.personalFolderSection.querySelectorAll(
    ".editor-only-content-card",
  );
  const editorMousePointer = DOM.personalFolderSection.querySelectorAll(
    ".editor-hover-pointer",
  );
  if (personalFolderIsEditing) {
    editorOnlyContent.forEach((content) => showElement(content));
    editorMousePointer.forEach((element) => {
      element.style.cursor = "pointer";
    });
    editorOnlyContentCard.forEach((card) => {
      const wrapper = card.closest("a");
      if (wrapper?.classList.contains("hidden")) {
        showElement(wrapper);
      }
      showElement(card);
      if (card.classList.contains("visiblity-hidden")) {
        card.style.opacity = "0.5";
      }
    });
    editorTool.forEach(async (tool) => showElement(tool));
    editModeToggleButton.textContent = "Exit editing";
  } else {
    editorOnlyContent.forEach((content) => hideElement(content));
    editorMousePointer.forEach((element) => {
      element.style.cursor = "default";
    });
    editorOnlyContentCard.forEach((card) => {
      hideElement(card);
      const wrapper = card.closest("a");
      if (wrapper) hideElement(wrapper);
    });
    editorTool.forEach((tool) => hideElement(tool));
    editModeToggleButton.textContent = "Edit";
  }
}
DOM.editorBtn.editBtn.addEventListener("click", () => {
  personalFolderIsEditing = !personalFolderIsEditing;
  if (personalFolderIsEditing) {
    DOM.editorBtn.editBtn.textContent = "Exit mode";
    applyEditModeUI();
  } else {
    DOM.editorBtn.editBtn.textContent = "Edit";
    applyEditModeUI();
  }
});

// add category related function and listener
let isCategoryEditing = false;
let selectedCategoryId = null;
DOM.editorBtn.addCategoryBtn.addEventListener("click", () => {
  console.log("clicked");
  fadeInEffect(DOM.categoryPopup.popup);
});
DOM.categoryPopup.closeBtn.addEventListener("click", async () => {
  await fadeOutEffect(DOM.categoryPopup.popup);
  resetAddCategoryPopup();
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
      `userData/${appState.userId}/personalFolder/${selectedCategoryId}/metaData`,
      { name: title },
    );
    trackEditEvent(
      appState.activeSem,
      appState.activeDiv,
      "Personal folder",
      "Edited category name to:" + title,
    );
  } else {
    showSectionLoader("Adding category...");
    await pushData(`userData/${appState.userId}/personalFolder`, {
      metaData: { name: title, isVisible: true },
    });
    trackCreateEvent(
      appState.activeSem,
      appState.activeDiv,
      "Personal folder",
      "Added category:" + title,
    );
  }
  await fadeOutEffect(DOM.categoryPopup.popup);
  showSectionLoader("Syncing data...");
  resetAddCategoryPopup();
  await syncDbData();
  await loadPersonalFolderSection();
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
async function deleteCategory() {
  const confirm = await showConfirmationPopup(
    "All the content in this category will be deleted forever",
  );
  if (!confirm) return;
  showSectionLoader("Deleting category...");
  const data = appState.personalFolder[selectedCategoryId];
  let totalSize = 0;
  showSectionLoader("Deleting individual content...");
  for (const key in data.itemList) {
    const element = data.itemList[key];
    if (element.attachmentId === "custom-link") continue;
    totalSize += element.size || 0;
    console.log(totalSize);

    await deleteDriveFile(element.attachmentId);
  }
  showSectionLoader("Deleting category...");
  const prevSizeUsed = appState.personalFolder?.metaData?.sizeUsed || 0;
  const newSizeUsed = Math.max(0, prevSizeUsed - totalSize);
  await updateData(`userData/${appState.userId}/personalFolder/metaData`, {
    sizeUsed: newSizeUsed,
  });
  await deleteData(
    `userData/${appState.userId}/personalFolder/${selectedCategoryId}`,
  );
  trackDeleteEvent(
    appState.activeSem,
    appState.activeDiv,
    "Personal folder",
    "Deleted category:" + data.metaData.name,
  );
  await showSectionLoader("Syncing data...");
  await syncDbData();
  await loadPersonalFolderSection();
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
    appState.personalFolder[selectedCategoryId].metaData.name;
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
    `userData/${appState.userId}/personalFolder/${selectedCategoryId}/metaData`,
    {
      isVisible:
        !appState.personalFolder[selectedCategoryId].metaData.isVisible,
    },
  );
  await showSectionLoader("Syncing data...");
  await syncDbData();
  await loadPersonalFolderSection();
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
    if (
      appState.personalFolder?.metaData.sizeUsed + file.size >
      30 * 1024 * 1024
    ) {
      showElement(DOM.itemPopup.errors.file);
      showWarningPopup(
        "Storage limit exceeded(50Mb). Please delete some files to upload new ones.",
      );
      DOM.itemPopup.inputs.file.value = "";
      return;
    }
    hideElement(DOM.itemPopup.fileAttachment.icon);
    DOM.itemPopup.fileAttachment.text.textContent = "1 file attached";
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
  try {
    if (file) {
      showSectionLoader("Uploading file...");
      let uploaded = await uploadDriveFile(
        file,
        `personalFolder/${appState.userId}/${selectedCategoryId}`,
      );
      if (!uploaded) {
        return;
      }
      attachmentURL = uploaded.webViewLink;
      attachmentId = uploaded.fileId;
    } else {
      attachmentURL = link;
      if (link !== originalLink) {
        attachmentId = "custom-link";
      } else {
        attachmentId = originalAttachmentId;
      }
    }
    if (isItemEditing) {
      if (originalAttachmentId !== attachmentId) {
        showSectionLoader("Updating storage usage...");
        const oldSize =
          appState.personalFolder?.[selectedCategoryId]?.itemList?.[selectedItemId]
            ?.size || 0;
        const newSize = file ? file.size : 0;
        await updateData(`userData/${appState.userId}/personalFolder/metaData`, {
          sizeUsed: Math.max(
            0,
            (appState.personalFolder?.metaData?.sizeUsed || 0) -
            oldSize +
            newSize,
          ),
        });
        if (originalAttachmentId && originalAttachmentId !== "custom-link") {
          try { await deleteDriveFile(originalAttachmentId); } catch (e) {}
        }
      }
      showSectionLoader("Updating item...");
      await updateData(
        `userData/${appState.userId}/personalFolder/${selectedCategoryId}/itemList/${selectedItemId}`,
        {
          name: title,
          link: attachmentURL,
          attachmentId,
          size: file ? file.size : 0,
        },
      );
      trackEditEvent(
        appState.activeSem,
        appState.activeDiv,
        "Personal folder",
        "Updated item:" + title,
      );
    } else {
      showSectionLoader("Adding item...");
      await pushData(
        `userData/${appState.userId}/personalFolder/${selectedCategoryId}/itemList`,
        {
          name: title,
          link: attachmentURL,
          attachmentId,
          createdAt: Date.now(),
          isVisible: true,
          size: file ? file.size : 0,
        },
      );
      await updateData(`userData/${appState.userId}/personalFolder/metaData`, {
        sizeUsed:
          (appState.personalFolder?.metaData?.sizeUsed || 0) +
          (file ? file.size : 0),
      });
      trackCreateEvent(
        appState.activeSem,
        appState.activeDiv,
        "Personal folder",
        "Added item:" + title,
      );
    }
    await showSectionLoader("Syncing data...");
    await fadeOutEffect(DOM.itemPopup.popup);
    await syncDbData();
    resetAddItemPopup();
    await loadPersonalFolderSection();
  } catch (err) {
    console.error("Error adding/updating item:", err);
  } finally {
    hideSectionLoader();
  }
});
DOM.itemPopup.editTools.unhideBtn.addEventListener("click", async () => {
  const title =
    `userData/${appState.userId}/personalFolder/${selectedCategoryId}/itemList/${selectedItemId}`
      .name;
  let confirm = await showConfirmationPopup(
    "Are you sure you want to unhide this item?",
  );
  if (!confirm) return;
  showSectionLoader("Unhiding item...");
  await updateData(
    `userData/${appState.userId}/personalFolder/${selectedCategoryId}/itemList/${selectedItemId}`,
    { isVisible: true },
  );
  await showSectionLoader("Syncing data...");
  await fadeOutEffect(DOM.itemPopup.popup);
  await syncDbData();
  trackEditEvent(
    appState.activeSem,
    appState.activeDiv,
    "Personal folder",
    "Unhide item:" + title,
  );
  resetAddItemPopup();
  await loadPersonalFolderSection();
  hideSectionLoader();
});
DOM.itemPopup.editTools.hideBtn.addEventListener("click", async () => {
  const title =
    `userData/${appState.userId}/personalFolder/${selectedCategoryId}/itemList/${selectedItemId}`
      .name;
  let confirm = await showConfirmationPopup(
    "Are you sure you want to hide this item?",
  );
  if (!confirm) return;
  showSectionLoader("Hiding item...");
  await updateData(
    `userData/${appState.userId}/personalFolder/${selectedCategoryId}/itemList/${selectedItemId}`,
    { isVisible: false },
  );
  await showSectionLoader("Syncing data...");
  await fadeOutEffect(DOM.itemPopup.popup);
  trackEditEvent(
    appState.activeSem,
    appState.activeDiv,
    "Personal folder",
    "Hide item:" + title,
  );

  await syncDbData();
  resetAddItemPopup();
  await loadPersonalFolderSection();
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
      appState.personalFolder?.[selectedCategoryId]?.itemList?.[selectedItemId];
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
    await updateData(`userData/${appState.userId}/personalFolder/metaData`, {
      sizeUsed: Math.max(
        0,
        (appState.personalFolder?.metaData?.sizeUsed || 0) - (itemData?.size || 0),
      ),
    });
    await deleteData(
      `userData/${appState.userId}/personalFolder/${selectedCategoryId}/itemList/${selectedItemId}`,
    );
    await showSectionLoader("Syncing data...");
    await fadeOutEffect(DOM.itemPopup.popup);
    trackDeleteEvent(
      appState.activeSem,
      appState.activeDiv,
      "Personal folder",
      "Deleted item:" + name,
    );
    await syncDbData();
    resetAddItemPopup();
    await loadPersonalFolderSection();
  } catch (err) {
    console.error("Error deleting personal folder item:", err);
  } finally {
    hideSectionLoader();
  }
});
function renderResources() {
  const rawCategory = appState.personalFolder || {};
  const categoryData = Object.fromEntries(
    Object.entries(rawCategory).reverse(),
  );
  Object.values(categoryData).reverse();
  if (!categoryData || !Object.keys(categoryData).length) {
    return;
  }

  for (const categoryId in categoryData) {
    if (categoryId === "metaData") continue;
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
      if (!item.isVisible) {
        card.className =
          "card p-4 w-full text-center  bg-surface-2 rounded-[1.25rem] editor-only-content-card opacity-50";
        link.classList.add("hidden");
      } else
        card.className =
          "card p-4 w-full text-center bg-surface-2 rounded-[1.25rem] custom-hover";

      card.textContent = item.name.charAt(0).toUpperCase() + item.name.slice(1);
      link.appendChild(card);
      cardContainer.appendChild(link);

      // listner
      card.addEventListener("click", (e) => {
        if (personalFolderIsEditing) {
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
    DOM.personalFolderSection.appendChild(container);
  }
}
function showWarningPopup(message) {
  return new Promise((resolve) => {
    DOM.warningPopup.message.textContent = message;
    fadeInEffect(DOM.warningPopup.popup);
    DOM.warningPopup.successBtn.addEventListener("click", async () => {
      await fadeOutEffect(DOM.warningPopup.popup);
      resolve(true);
    });
  });
}
