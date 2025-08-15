<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 500px; max-width: 700px">
      <q-card-section>
        <div class="text-h6">編輯內容</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <!-- 內容標籤名稱 -->
        <q-input dense v-model="contentLabel" autofocus label="內容標籤名稱" class="q-mb-md" />

        <!-- 選擇分類 -->
        <q-select
          v-model="selectedCategory"
          :options="categoryOptions"
          label="選擇分類"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          class="q-mb-md"
          :disable="categoryOptions.length === 0"
        >
          <template v-if="categoryOptions.length === 0" v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey"> 請先新增分類 </q-item-section>
            </q-item>
          </template>
        </q-select>

        <!-- 內容編輯器 -->
        <div class="q-mb-md">
          <div class="text-subtitle2 q-mb-xs">內容</div>
          <q-editor
            v-model="content"
            min-height="5rem"
            :toolbar="[
              ['left', 'center', 'right', 'justify'],
              ['bold', 'italic', 'underline', 'strike'],
              ['quote', 'unordered', 'ordered'],
              ['undo', 'redo'],
            ]"
          />
        </div>
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="取消" @click="handleCancel" />
        <q-btn flat label="更新" @click="handleSubmit" :disable="!isFormValid" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';

interface ContentItem {
  id: string;
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

interface CategoryOption {
  label: string;
  value: string;
  color: string;
}

interface Props {
  modelValue: boolean;
  categories: CategoryOption[];
  contentItem: ContentItem | null;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'submit', editedContent: EditContentItem): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const showDialog = ref(false);
const contentLabel = ref('');
const content = ref('');
const selectedCategory = ref<string>('');

// 分類選項
const categoryOptions = computed(() => {
  return props.categories.map((cat) => ({
    label: cat.label,
    value: cat.value,
    color: cat.color,
  }));
});

// 表單驗證
const isFormValid = computed(() => {
  return (
    contentLabel.value.trim() !== '' && content.value.trim() !== '' && selectedCategory.value !== ''
  );
});

// 監聽 props.modelValue 的變化
watch(
  () => props.modelValue,
  (newValue) => {
    showDialog.value = newValue;
    if (newValue && props.contentItem) {
      // 當對話框打開時，填入現有內容
      contentLabel.value = props.contentItem.label;
      content.value = props.contentItem.content;
      selectedCategory.value = props.contentItem.categoryId;
    }
  },
);

// 監聽內部 showDialog 的變化
watch(showDialog, (newValue) => {
  emit('update:modelValue', newValue);
  if (!newValue) {
    resetForm();
  }
});

const handleSubmit = () => {
  if (isFormValid.value && props.contentItem) {
    emit('submit', {
      id: props.contentItem.id,
      label: contentLabel.value.trim(),
      content: content.value.trim(),
      categoryId: selectedCategory.value,
    });
    handleCancel();
  }
};

const handleCancel = () => {
  showDialog.value = false;
};

const resetForm = () => {
  contentLabel.value = '';
  content.value = '';
  selectedCategory.value = '';
};
</script>

<style scoped lang="scss">
.q-editor {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}
</style>
