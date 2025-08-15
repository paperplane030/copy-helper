<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">編輯分類</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input
          dense
          v-model="categoryName"
          autofocus
          label="分類名稱"
          @keyup.enter="handleSubmit"
        />

        <div class="q-mt-md">
          <div class="text-subtitle2 q-mb-xs">分類顏色</div>
          <q-input
            v-model="categoryColor"
            label="顏色"
            readonly
            class="cursor-pointer"
            @click="openColorPicker"
          >
            <template v-slot:prepend>
              <div :style="{ backgroundColor: categoryColor }" class="color-preview"></div>
            </template>
            <template v-slot:append>
              <q-icon name="palette" class="cursor-pointer" @click="openColorPicker" />
            </template>
          </q-input>

          <!-- 顏色選擇器彈窗 -->
          <q-dialog v-model="showColorPicker">
            <q-card style="min-width: 300px">
              <q-card-section>
                <div class="text-h6">選擇顏色</div>
              </q-card-section>

              <q-card-section class="q-pt-none">
                <q-color v-model="categoryColor" class="full-width" />
              </q-card-section>

              <q-card-actions align="right">
                <q-btn flat label="取消" @click="cancelColorPicker" />
                <q-btn flat label="確定" color="primary" @click="confirmColorPicker" />
              </q-card-actions>
            </q-card>
          </q-dialog>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="取消" @click="handleCancel" />
        <q-btn flat label="更新" @click="handleSubmit" :disable="!categoryName.trim()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface EditCategory {
  id: string;
  name: string;
  color: string;
}

interface Props {
  modelValue: boolean;
  category: Category | null;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'submit', category: EditCategory): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const showDialog = ref(false);
const categoryName = ref('');
const categoryColor = ref('#1976D2');
const showColorPicker = ref(false);
const tempColor = ref('#1976D2');

// 監聽 props.modelValue 的變化
watch(
  () => props.modelValue,
  (newValue) => {
    showDialog.value = newValue;
    if (newValue && props.category) {
      // 當對話框打開時，填入現有分類資料
      categoryName.value = props.category.name;
      categoryColor.value = props.category.color;
      tempColor.value = props.category.color;
    }
  },
);

// 監聽內部 showDialog 的變化
watch(showDialog, (newValue) => {
  emit('update:modelValue', newValue);
  if (!newValue) {
    // 當對話框關閉時重置表單
    resetForm();
  }
});

const handleSubmit = () => {
  if (categoryName.value.trim() && props.category) {
    emit('submit', {
      id: props.category.id,
      name: categoryName.value.trim(),
      color: categoryColor.value,
    });
    showDialog.value = false;
  }
};

const handleCancel = () => {
  showDialog.value = false;
};

const resetForm = () => {
  categoryName.value = '';
  categoryColor.value = '#1976D2';
  tempColor.value = '#1976D2';
};

const openColorPicker = () => {
  tempColor.value = categoryColor.value; // 保存當前顏色作為備份
  showColorPicker.value = true;
};

const cancelColorPicker = () => {
  showColorPicker.value = false;
  categoryColor.value = tempColor.value; // 恢復到之前的顏色
};

const confirmColorPicker = () => {
  tempColor.value = categoryColor.value; // 保存選擇的顏色
  showColorPicker.value = false;
};
</script>

<style scoped lang="scss">
.my-picker {
  max-width: 300px;
}

.color-preview {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
