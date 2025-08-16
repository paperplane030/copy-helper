<template>
  <div class="index-page">
    <div class="q-pa-md">
      <div class="q-mb-md q-gutter-sm">
        <q-btn
          color="primary"
          label="新增分類"
          icon="add"
          unelevated
          class="action-btn"
          @click="showAddCategoryDialog = true"
        />
        <q-btn
          color="secondary"
          label="新增內容"
          icon="note_add"
          unelevated
          class="action-btn"
          @click="showAddContentDialog = true"
          :disable="categoryStore.data.length === 0"
        />
        <q-btn
          color="grey-7"
          :label="allExpanded ? '收合全部' : '展開全部'"
          :icon="allExpanded ? 'unfold_less' : 'unfold_more'"
          outline
          class="action-btn"
          @click="toggleAllCategories"
          :disable="categoryStore.data.length === 0"
        >
          <q-tooltip v-if="categoryStore.data.length > 0">
            {{ allExpanded ? '點擊收合所有分類' : '點擊展開所有分類' }}
            <br />
            (快捷鍵: Ctrl/Cmd + E)
          </q-tooltip>
        </q-btn>
      </div>
      <!-- 顯示現有分類 -->
      <div v-if="categoryStore.data.length > 0" class="q-mb-md">
        <div class="categories-grid">
          <q-card
            v-for="category in categoryStore.data"
            :key="category.category_id"
            class="category-card"
            :style="{
              background: `linear-gradient(135deg, ${category.category_color}20, ${category.category_color}10)`,
            }"
          >
            <q-card-section>
              <div class="row items-center q-gutter-sm q-mb-sm category-header">
                <div
                  class="row items-center q-gutter-sm flex-1 cursor-pointer category-toggle"
                  @click="toggleCategory(category.category_id)"
                >
                  <div
                    :style="{ backgroundColor: category.category_color }"
                    class="q-pa-xs category-color-indicator"
                    style="width: 20px; height: 20px; border-radius: 4px"
                  ></div>
                  <div class="text-subtitle1 flex-1">
                    {{ category.category_name }}
                  </div>
                  <div class="text-caption content-count">{{ category.context.length }}</div>
                  <q-icon
                    :name="expandedCategories[category.category_id] ? 'expand_less' : 'expand_more'"
                    size="sm"
                    class="transition-transform expand-icon"
                    :class="{ 'rotate-180': !expandedCategories[category.category_id] }"
                  />
                </div>

                <!-- 分類操作按鈕 -->
                <div class="row q-gutter-xs category-actions">
                  <!-- 內容全部展開/收合按鈕 -->
                  <q-btn
                    v-if="category.context.length > 0"
                    flat
                    dense
                    round
                    :icon="
                      getCategoryContentExpandState(category.category_id).allExpanded
                        ? 'unfold_less'
                        : 'unfold_more'
                    "
                    size="sm"
                    color="info"
                    @click="toggleCategoryContents(category.category_id)"
                  >
                    <q-tooltip>
                      {{
                        getCategoryContentExpandState(category.category_id).allExpanded
                          ? '收合該分類所有內容'
                          : '展開該分類所有內容'
                      }}
                    </q-tooltip>
                  </q-btn>

                  <q-btn
                    flat
                    dense
                    round
                    icon="edit"
                    size="sm"
                    color="primary"
                    @click="openEditCategoryDialog(category)"
                  />
                  <q-btn
                    flat
                    dense
                    round
                    icon="delete"
                    size="sm"
                    color="negative"
                    @click="deleteCategory(category.category_id, category.category_name)"
                  />
                </div>
              </div>

              <!-- 顯示內容列表 - 使用展開動畫 -->
              <q-slide-transition>
                <div v-if="expandedCategories[category.category_id]" class="q-mt-sm">
                  <div v-if="category.context.length > 0" class="content-list">
                    <div
                      class="sortable-content-list"
                      :data-sortable-category="category.category_id"
                    >
                      <div
                        v-for="content in category.context"
                        :key="content.id"
                        class="content-item q-pa-sm q-mb-xs"
                        :data-content-id="content.id"
                        :style="{
                          background: `linear-gradient(135deg, ${category.category_color}15, ${category.category_color}08)`,
                          '--category-color': category.category_color,
                          '--category-color-light': `${category.category_color}20`,
                          '--category-color-hover': `${category.category_color}25`,
                          '--category-color-border': `${category.category_color}40`,
                        }"
                      >
                        <!-- 內容標題行 - 點擊可展開/收合 -->
                        <div class="row items-center q-gutter-sm">
                          <!-- 拖曳手柄 -->
                          <div class="drag-handle cursor-move q-px-xs">
                            <q-icon name="drag_indicator" size="sm" color="grey-6" />
                          </div>

                          <div
                            class="col cursor-pointer content-toggle"
                            @click="toggleContent(content.id)"
                          >
                            <div class="row items-center q-gutter-sm">
                              <div class="text-subtitle2 flex-1">{{ content.label }}</div>
                              <q-icon
                                :name="expandedContents[content.id] ? 'expand_less' : 'expand_more'"
                                size="sm"
                                class="transition-transform content-expand-icon"
                              />
                            </div>
                          </div>
                          <div class="row q-gutter-xs content-actions">
                            <q-btn
                              flat
                              dense
                              round
                              icon="content_copy"
                              size="sm"
                              color="info"
                              @click="copyToClipboard(content.content)"
                            >
                              <q-tooltip>複製內容</q-tooltip>
                            </q-btn>
                            <q-btn
                              flat
                              dense
                              round
                              icon="edit"
                              size="sm"
                              color="primary"
                              @click="openEditDialog(content, category.category_id)"
                            />
                            <q-btn
                              flat
                              dense
                              round
                              icon="delete"
                              size="sm"
                              color="negative"
                              @click="deleteContent(category.category_id, content.id)"
                            />
                          </div>
                        </div>

                        <!-- 展開的內容詳情 -->
                        <q-slide-transition>
                          <div v-if="expandedContents[content.id]" class="q-mt-sm">
                            <div
                              class="text-caption text-grey-7 content-detail cursor-pointer"
                              v-html="content.content"
                              @click="copyToClipboard(content.content)"
                            ></div>
                          </div>
                        </q-slide-transition>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-center text-grey-6 q-py-md">此分類目前沒有內容</div>
                </div>
              </q-slide-transition>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="row items-center justify-evenly"></div>

      <!-- 新增分類對話框 -->
      <AddCategoryDialog v-model="showAddCategoryDialog" @submit="handleAddCategory" />

      <!-- 新增內容對話框 -->
      <AddContentDialog
        v-model="showAddContentDialog"
        :categories="categoryOptions"
        @submit="handleAddContent"
      />

      <!-- 編輯內容對話框 -->
      <EditContentDialog
        v-model="showEditContentDialog"
        :categories="categoryOptions"
        :content-item="editingContent"
        @submit="handleEditContent"
      />

      <!-- 編輯分類對話框 -->
      <EditCategoryDialog
        v-model="showEditCategoryDialog"
        :category="editingCategory"
        @submit="handleEditCategory"
      />

      <!-- 刪除內容確認對話框 -->
      <q-dialog v-model="showDeleteConfirmDialog" persistent>
        <q-card style="min-width: 300px">
          <q-card-section>
            <div class="text-h6">確認刪除內容</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            您確定要刪除此內容嗎？此操作無法復原。
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="取消" color="grey" @click="cancelDelete" />
            <q-btn flat label="刪除" color="negative" @click="confirmDelete" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- 刪除分類確認對話框 -->
      <q-dialog v-model="showDeleteCategoryDialog" persistent>
        <q-card style="min-width: 300px">
          <q-card-section>
            <div class="text-h6">確認刪除分類</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            您確定要刪除分類「{{ deleteCategoryName }}」嗎？
            <br />
            <span class="text-red">此操作將同時刪除該分類下的所有內容，且無法復原。</span>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="取消" color="grey" @click="cancelDeleteCategory" />
            <q-btn flat label="刪除" color="negative" @click="confirmDeleteCategory" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { Notify } from 'quasar';
import Sortable from 'sortablejs';
import AddCategoryDialog from 'components/AddCategoryDialog.vue';
import AddContentDialog from 'components/AddContentDialog.vue';
import EditContentDialog from 'components/EditContentDialog.vue';
import EditCategoryDialog from 'components/EditCategoryDialog.vue';
import { useCategoryStore, type ContentItem as StoreContentItem } from 'stores/category-store';

// HTML轉純文字函數
function htmlToTxt(html: string): string {
  return (
    html
      // 先處理 Quasar 編輯器的格式：<div> 開始標籤前加換行（除了第一個）
      .replace(/(<div[^>]*>)/gi, '\n$1')
      // <div> 結束標籤換成換行
      .replace(/<\/div>/gi, '\n')
      // <br> 換成換行
      .replace(/<br\s*\/?>/gi, '\n')
      // 移除其他標籤
      .replace(/<[^>]+>/g, '')
      // 把多餘空白處理乾淨
      .replace(/\n\s*\n/g, '\n')
      .trim()
  );
}

interface Category {
  name: string;
  color: string;
}

interface ContentItem {
  label: string;
  content: string;
  categoryId: string;
}

interface EditContentItem {
  id: string;
  label: string;
  content: string;
  categoryId: string;
}

const showAddCategoryDialog = ref(false);
const showAddContentDialog = ref(false);
const showEditContentDialog = ref(false);
const showEditCategoryDialog = ref(false);
const showDeleteConfirmDialog = ref(false);
const showDeleteCategoryDialog = ref(false);
const categoryStore = useCategoryStore();

// 管理每個分類的展開狀態
const expandedCategories = ref<Record<string, boolean>>({});

// 管理每個內容項目的展開狀態
const expandedContents = ref<Record<string, boolean>>({});

// 拖曳排序相關狀態
const sortableInstances = ref<Record<string, Sortable>>({});

// 初始化拖曳排序
const initializeSortable = () => {
  // 等待下一個 tick 確保 DOM 已更新
  void nextTick(() => {
    categoryStore.data.forEach((category) => {
      const containerElement = document.querySelector(
        `[data-sortable-category="${category.category_id}"]`,
      ) as HTMLElement;

      if (containerElement && category.context.length > 1) {
        // 清理現有的實例
        const existingInstance = sortableInstances.value[category.category_id];
        if (existingInstance) {
          existingInstance.destroy();
        }

        // 創建新的拖曳實例
        sortableInstances.value[category.category_id] = Sortable.create(containerElement, {
          animation: 150,
          ghostClass: 'sortable-ghost',
          chosenClass: 'sortable-chosen',
          dragClass: 'sortable-drag',
          handle: '.drag-handle',
          onEnd: (evt) => {
            const categoryId = containerElement.dataset.sortableCategory;
            if (categoryId && evt.oldIndex !== undefined && evt.newIndex !== undefined) {
              handleContentReorder(categoryId, evt.oldIndex, evt.newIndex);
            }
          },
        });
      }
    });
  });
};

// 處理內容重新排序
const handleContentReorder = (categoryId: string, oldIndex: number, newIndex: number) => {
  const success = categoryStore.reorderContentInCategory(categoryId, oldIndex, newIndex);

  if (success) {
    Notify.create({
      message: '內容順序已更新',
      color: 'positive',
      position: 'top',
      timeout: 1500,
      icon: 'swap_vert',
    });
  } else {
    Notify.create({
      message: '排序失敗',
      color: 'negative',
      position: 'top',
      timeout: 2000,
      icon: 'error',
    });
  }
};

// 初始化展開狀態 - 所有分類預設展開
const initializeExpandedStates = () => {
  const newExpanded: Record<string, boolean> = {};
  categoryStore.data.forEach((category) => {
    newExpanded[category.category_id] = true;
  });
  expandedCategories.value = newExpanded;
};

// 頁面載入時初始化
onMounted(() => {
  initializeExpandedStates();
  initializeSortable();

  // 添加鍵盤快捷鍵支持
  const handleKeyPress = (event: KeyboardEvent) => {
    // Ctrl + E 或 Cmd + E：切換全部展開/收合
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'e') {
      event.preventDefault();
      if (categoryStore.data.length > 0) {
        toggleAllCategories();
      }
    }
  };

  document.addEventListener('keydown', handleKeyPress);

  // 在組件卸載時清理事件監聽器
  onBeforeUnmount(() => {
    // 清理拖曳實例
    Object.values(sortableInstances.value).forEach((instance) => {
      instance?.destroy();
    });

    document.removeEventListener('keydown', handleKeyPress);
  });
});

// 監聽分類數據變化，為新分類設置預設展開狀態
watch(
  () => categoryStore.data,
  (newCategories, oldCategories) => {
    // 如果有新分類加入，為其設置展開狀態
    newCategories.forEach((category) => {
      if (!(category.category_id in expandedCategories.value)) {
        expandedCategories.value[category.category_id] = true;
      }
    });

    // 如果分類被刪除，清理其展開狀態和相關內容的展開狀態
    if (oldCategories) {
      const newIds = new Set(newCategories.map((cat) => cat.category_id));
      Object.keys(expandedCategories.value).forEach((id) => {
        if (!newIds.has(id)) {
          delete expandedCategories.value[id];
        }
      });

      // 清理已刪除內容的展開狀態
      const allCurrentContentIds = new Set();
      newCategories.forEach((category) => {
        category.context.forEach((content) => {
          allCurrentContentIds.add(content.id);
        });
      });

      Object.keys(expandedContents.value).forEach((contentId) => {
        if (!allCurrentContentIds.has(contentId)) {
          delete expandedContents.value[contentId];
        }
      });
    }

    // 重新初始化拖曳排序
    initializeSortable();
  },
  { deep: true },
);

// 計算是否所有分類都展開
const allExpanded = computed(() => {
  if (categoryStore.data.length === 0) return false;
  return categoryStore.data.every((category) => expandedCategories.value[category.category_id]);
});

// 獲取特定分類下所有內容的展開狀態
const getCategoryContentExpandState = (categoryId: string) => {
  const category = categoryStore.data.find((cat) => cat.category_id === categoryId);
  if (!category || category.context.length === 0) return { allExpanded: false, hasContent: false };

  const allExpanded = category.context.every((content) => expandedContents.value[content.id]);
  return { allExpanded, hasContent: true };
};

// 切換特定分類下所有內容的展開狀態
const toggleCategoryContents = (categoryId: string) => {
  const category = categoryStore.data.find((cat) => cat.category_id === categoryId);
  if (!category) return;

  const { allExpanded } = getCategoryContentExpandState(categoryId);
  const shouldExpand = !allExpanded;

  category.context.forEach((content) => {
    expandedContents.value[content.id] = shouldExpand;
  });

  // 提供用戶反饋
  Notify.create({
    message: shouldExpand ? '已展開該分類所有內容' : '已收合該分類所有內容',
    color: 'info',
    position: 'top',
    timeout: 1000,
    icon: shouldExpand ? 'unfold_more' : 'unfold_less',
  });
};

// 編輯內容相關狀態
const editingContent = ref<{
  id: string;
  label: string;
  content: string;
  categoryId: string;
} | null>(null);

// 刪除確認相關狀態
const deleteTargetCategory = ref<string | null>(null);
const deleteTargetContent = ref<string | null>(null);

// 編輯分類相關狀態
const editingCategory = ref<{
  id: string;
  name: string;
  color: string;
} | null>(null);

// 刪除分類相關狀態
const deleteCategoryId = ref<string | null>(null);
const deleteCategoryName = ref<string>('');

// 切換分類展開狀態
const toggleCategory = (categoryId: string) => {
  expandedCategories.value[categoryId] = !expandedCategories.value[categoryId];
};

// 切換內容項目展開狀態
const toggleContent = (contentId: string) => {
  expandedContents.value[contentId] = !expandedContents.value[contentId];
};

// 智能切換全部分類的展開狀態
const toggleAllCategories = () => {
  // 如果所有分類都展開，則全部收合
  // 如果有任何分類收合，則全部展開
  const shouldExpand = !allExpanded.value;

  const newExpanded: Record<string, boolean> = {};
  categoryStore.data.forEach((category) => {
    newExpanded[category.category_id] = shouldExpand;
  });

  expandedCategories.value = newExpanded;

  // 同時切換所有內容項目的展開狀態
  toggleAllContents(shouldExpand);

  // 提供用戶反饋
  Notify.create({
    message: shouldExpand ? '已展開所有分類和內容' : '已收合所有分類和內容',
    color: 'info',
    position: 'top',
    timeout: 1500,
    icon: shouldExpand ? 'unfold_more' : 'unfold_less',
  });
};

// 切換所有內容項目的展開狀態
const toggleAllContents = (shouldExpand: boolean) => {
  const newExpandedContents: Record<string, boolean> = {};
  categoryStore.data.forEach((category) => {
    category.context.forEach((content) => {
      newExpandedContents[content.id] = shouldExpand;
    });
  });
  expandedContents.value = newExpandedContents;
};

// 打開編輯對話框
const openEditDialog = (content: StoreContentItem, categoryId: string) => {
  editingContent.value = {
    id: content.id,
    label: content.label,
    content: content.content,
    categoryId: categoryId,
  };
  showEditContentDialog.value = true;
};

// 刪除內容
const deleteContent = (categoryId: string, contentId: string) => {
  showDeleteConfirmDialog.value = true;
  deleteTargetCategory.value = categoryId;
  deleteTargetContent.value = contentId;
};

// 確認刪除
const confirmDelete = () => {
  if (deleteTargetCategory.value && deleteTargetContent.value) {
    const success = categoryStore.removeContentFromCategory(
      deleteTargetCategory.value,
      deleteTargetContent.value,
    );
    if (success) {
      Notify.create({
        message: '內容已刪除',
        color: 'positive',
        position: 'top',
        timeout: 2000,
        icon: 'delete',
      });
    } else {
      Notify.create({
        message: '刪除失敗',
        color: 'negative',
        position: 'top',
        timeout: 2000,
        icon: 'error',
      });
    }
  }
  showDeleteConfirmDialog.value = false;
  deleteTargetCategory.value = null;
  deleteTargetContent.value = null;
};

// 取消刪除
const cancelDelete = () => {
  showDeleteConfirmDialog.value = false;
  deleteTargetCategory.value = null;
  deleteTargetContent.value = null;
};

// 為內容對話框準備分類選項
const categoryOptions = computed(() => {
  return categoryStore.data.map((category) => ({
    label: category.category_name,
    value: category.category_id,
    color: category.category_color,
  }));
});

const handleAddCategory = (category: Category) => {
  console.log('新增分類:', category);

  // 將分類新增到 store
  categoryStore.addCategory(category.name, category.color);

  // 為新分類設置展開狀態（在下次 tick 後執行，確保分類已添加到 store）
  setTimeout(() => {
    const newCategory = categoryStore.data[categoryStore.data.length - 1];
    if (newCategory) {
      expandedCategories.value[newCategory.category_id] = true;
    }
  }, 0);

  console.log('目前所有分類:', categoryStore.getAllCategories());
};

const handleAddContent = (contentItem: ContentItem) => {
  console.log('新增內容:', contentItem);

  // 將內容新增到指定分類
  const success = categoryStore.addContentToCategory(
    contentItem.categoryId,
    contentItem.label,
    contentItem.content,
  );

  if (success) {
    console.log('內容新增成功');
    console.log('目前所有分類:', categoryStore.getAllCategories());
  } else {
    console.error('內容新增失敗：找不到指定分類');
  }
};

const handleEditContent = (editedContent: EditContentItem) => {
  console.log('編輯內容:', editedContent);

  // 如果分類改變了，需要先從原分類移除，再加到新分類
  if (editingContent.value && editedContent.categoryId !== editingContent.value.categoryId) {
    // 從原分類移除
    categoryStore.removeContentFromCategory(editingContent.value.categoryId, editedContent.id);

    // 加到新分類
    const success = categoryStore.addContentToCategory(
      editedContent.categoryId,
      editedContent.label,
      editedContent.content,
    );

    if (success) {
      Notify.create({
        message: '內容已更新並移動到新分類',
        color: 'positive',
        position: 'top',
        timeout: 2000,
        icon: 'edit',
      });
    }
  } else {
    // 同分類內編輯，先移除再新增
    categoryStore.removeContentFromCategory(editedContent.categoryId, editedContent.id);
    const success = categoryStore.addContentToCategory(
      editedContent.categoryId,
      editedContent.label,
      editedContent.content,
    );

    if (success) {
      Notify.create({
        message: '內容已更新',
        color: 'positive',
        position: 'top',
        timeout: 2000,
        icon: 'edit',
      });
    }
  }

  // 關閉編輯對話框並重置狀態
  editingContent.value = null;
  showEditContentDialog.value = false;
};

// 打開編輯分類對話框
const openEditCategoryDialog = (category: {
  category_id: string;
  category_name: string;
  category_color: string;
}) => {
  editingCategory.value = {
    id: category.category_id,
    name: category.category_name,
    color: category.category_color,
  };
  showEditCategoryDialog.value = true;
};

// 處理編輯分類
const handleEditCategory = (editedCategory: { id: string; name: string; color: string }) => {
  const success = categoryStore.updateCategory(
    editedCategory.id,
    editedCategory.name,
    editedCategory.color,
  );

  if (success) {
    Notify.create({
      message: '分類已更新',
      color: 'positive',
      position: 'top',
      timeout: 2000,
      icon: 'edit',
    });
  } else {
    Notify.create({
      message: '更新失敗',
      color: 'negative',
      position: 'top',
      timeout: 2000,
      icon: 'error',
    });
  }

  showEditCategoryDialog.value = false;
  editingCategory.value = null;
};

// 刪除分類
const deleteCategory = (categoryId: string, categoryName: string) => {
  deleteCategoryId.value = categoryId;
  deleteCategoryName.value = categoryName;
  showDeleteCategoryDialog.value = true;
};

// 確認刪除分類
const confirmDeleteCategory = () => {
  if (deleteCategoryId.value) {
    // 在刪除前獲取分類信息，清理相關的展開狀態
    const category = categoryStore.data.find((cat) => cat.category_id === deleteCategoryId.value);
    if (category) {
      // 清理該分類下所有內容的展開狀態
      category.context.forEach((content) => {
        delete expandedContents.value[content.id];
      });
    }

    const success = categoryStore.removeCategoryById(deleteCategoryId.value);

    if (success) {
      Notify.create({
        message: '分類已刪除',
        color: 'positive',
        position: 'top',
        timeout: 2000,
        icon: 'delete',
      });

      // 清理該分類的展開狀態
      if (expandedCategories.value[deleteCategoryId.value]) {
        delete expandedCategories.value[deleteCategoryId.value];
      }
    } else {
      Notify.create({
        message: '刪除失敗',
        color: 'negative',
        position: 'top',
        timeout: 2000,
        icon: 'error',
      });
    }
  }

  cancelDeleteCategory();
};

// 取消刪除分類
const cancelDeleteCategory = () => {
  showDeleteCategoryDialog.value = false;
  deleteCategoryId.value = null;
  deleteCategoryName.value = '';
};

// 複製內容到剪貼簿
const copyToClipboard = async (content: string) => {
  try {
    // 使用自定義的HTML轉純文字函數，保持換行格式
    const textContent = htmlToTxt(content);

    await navigator.clipboard.writeText(textContent);

    Notify.create({
      message: '內容已複製到剪貼簿',
      color: 'positive',
      position: 'top',
      timeout: 2000,
      icon: 'content_copy',
    });
  } catch (error) {
    console.error('複製失敗:', error);
    Notify.create({
      message: '複製失敗',
      color: 'negative',
      position: 'top',
      timeout: 2000,
      icon: 'error',
    });
  }
};
</script>

<style scoped lang="scss">
.index-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #e8f5e8 0%, #f0fff0 50%, #e0f2e0 100%);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      radial-gradient(circle at 20% 80%, rgba(120, 200, 120, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(150, 220, 150, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(100, 180, 100, 0.05) 0%, transparent 50%);
    backdrop-filter: blur(1px);
    z-index: -1;
  }
}

/* Grid 布局容器 */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  max-width: 100%;

  // 大螢幕：確保最多三列，等寬分布
  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }

  // 中等螢幕：最多兩列
  @media (max-width: 1199px) and (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 1.25rem;
  }

  // 小螢幕：單列
  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

.q-card {
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
}

.category-card {
  transition: all 0.3s ease;
  position: relative;
  height: fit-content;
  padding: 1rem;

  // Grid 項目對齊
  display: flex;
  flex-direction: column;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    z-index: -1;
  }

  &:hover {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }

  // 確保卡片內容填滿高度
  .q-card-section {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
}

.category-header {
  padding: 8px;
  border-radius: 8px;
  margin: -8px;
}

.category-toggle {
  transition: all 0.2s ease;
  border-radius: 6px;
  padding: 4px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(8px);
  }
}

.category-color-indicator {
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .category-toggle:hover & {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
}

.content-count {
  background: rgba(255, 255, 255, 0.6);
  padding: 2px 6px;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
  font-weight: 500;
}

.expand-icon {
  transition: transform 0.3s ease;

  &.rotate-180 {
    transform: rotate(180deg);
  }
}

.transition-transform {
  transition: transform 0.3s ease;
}

.content-list {
  /* 移除高度限制，允許完全展開 */
  overflow-y: visible;
}

.content-item {
  transition: all 0.2s ease;
  border: 1px solid transparent;
  backdrop-filter: blur(8px);
  border-radius: 8px;
  position: relative;
  overflow: hidden;

  &:hover {
    background: var(--category-color-hover, rgba(255, 255, 255, 0.8)) !important;
    border-color: var(--category-color-border, rgba(33, 150, 243, 0.5));
    box-shadow: 0 4px 16px var(--category-color-light, rgba(33, 150, 243, 0.2));
    backdrop-filter: blur(12px);

    .content-actions {
      opacity: 1;
    }
  }
}

.content-toggle {
  transition: all 0.2s ease;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    background: var(--category-color-hover, rgba(33, 150, 243, 0.1));
  }
}

.content-expand-icon {
  transition: transform 0.3s ease;
  opacity: 0.6;

  .content-toggle:hover & {
    opacity: 1;
  }
}

.content-detail {
  padding: 8px 12px;
  background: #e9e9e9;
  border-radius: 6px;
  border-left: 3px solid var(--category-color-border, rgba(33, 150, 243, 0.3));
  word-break: break-word;
  white-space: normal;
  line-height: 1.4;

  &:hover {
    background: var(--category-color-light, rgba(33, 150, 243, 0.05));
    border-left-color: var(--category-color, rgba(33, 150, 243, 0.5));
  }
}

.content-actions {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.category-actions {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.category-card:hover .category-actions {
  opacity: 1;
}

/* 空狀態樣式 */
.text-grey-6 {
  font-style: italic;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  border: 1px dashed rgba(0, 0, 0, 0.1);
}

/* 按鈕樣式 */
.action-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  .q-icon {
    margin-right: 4px;
  }
}

/* 展開狀態指示器樣式 */
.expand-indicator {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.6);
  padding: 4px 8px;
  border-radius: 12px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-weight: 500;

  .q-icon {
    opacity: 0.7;
  }
}

/* 拖曳排序樣式 */
.drag-handle {
  opacity: 0.5;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
}

.content-item:hover .drag-handle {
  opacity: 0.8;
}

.sortable-ghost {
  opacity: 0.4;
  background: var(--category-color-light, rgba(33, 150, 243, 0.2)) !important;
}

.sortable-chosen {
  cursor: grabbing !important;
}

.sortable-drag {
  transform: rotate(5deg);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
}

.sortable-content-list {
  min-height: 20px; /* 確保拖曳區域有最小高度 */
}
</style>
