import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Cookies } from 'quasar';

export interface ContentItem {
  id: string;
  label: string;
  content: string;
  createdAt: string;
}

export interface CategoryItem {
  category_name: string;
  category_id: string;
  category_color: string;
  context: ContentItem[];
}

export interface CategoryData {
  data: CategoryItem[];
}

export const useCategoryStore = defineStore('category', () => {
  // 狀態
  const data = ref<CategoryItem[]>([]);

  // Cookie 相關常數
  const COOKIE_KEY = 'copy-helper-categories';
  const COOKIE_EXPIRY_DAYS = 365;

  // 將資料儲存到 cookie
  const saveDataToCookie = (): void => {
    try {
      const jsonData = JSON.stringify(data.value);
      console.log('Saving data to cookie:', jsonData); // 除錯用
      console.log('Data type:', typeof jsonData);

      const expires = new Date();
      expires.setDate(expires.getDate() + COOKIE_EXPIRY_DAYS);

      // 使用原生方式儲存，確保不被 Quasar 自動序列化
      const cookieString = `${COOKIE_KEY}=${encodeURIComponent(jsonData)}; expires=${expires.toUTCString()}; path=/`;
      document.cookie = cookieString;

      console.log('Cookie string set:', cookieString);
    } catch (error) {
      console.error('Failed to save data to cookie:', error);
    }
  };

  // 從 cookie 載入資料
  const loadDataFromCookie = (): void => {
    try {
      // 使用原生方式取得 cookie，確保是字串
      const getRawCookie = (name: string): string | null => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
          const cookieValue = parts.pop()?.split(';').shift();
          return cookieValue ? decodeURIComponent(cookieValue) : null;
        }
        return null;
      };

      const cookieData = getRawCookie(COOKIE_KEY);
      const quasarCookieData = Cookies.get(COOKIE_KEY); // 比較用

      console.log('=== Cookie Loading Debug ===');
      console.log('Raw native cookie data:', cookieData);
      console.log('Raw native cookie type:', typeof cookieData);
      console.log('Quasar cookie data:', quasarCookieData);
      console.log('Quasar cookie type:', typeof quasarCookieData);
      console.log('Are they equal?', cookieData === quasarCookieData);

      // 使用原生方式取得的 cookie 資料
      const finalCookieData = cookieData;

      console.log('Final cookie data:', finalCookieData);
      console.log('Final cookie data type:', typeof finalCookieData);
      console.log('Final cookie data length:', finalCookieData?.length);

      // 逐項檢查並記錄結果
      console.log('=== Validation Checks ===');

      const isExists = !!finalCookieData;
      console.log('1. cookieData exists:', isExists, finalCookieData ? '✓' : '✗');

      const isString = typeof finalCookieData === 'string';
      console.log('2. is string:', isString, isString ? '✓' : '✗');

      const isNotEmpty = finalCookieData && finalCookieData.trim() !== '';
      console.log('3. not empty after trim:', isNotEmpty, isNotEmpty ? '✓' : '✗');

      const isNotObjectString = finalCookieData !== '[object Object]';
      console.log('4. not "[object Object]":', isNotObjectString, isNotObjectString ? '✓' : '✗');

      const isNotUndefinedString = finalCookieData !== 'undefined';
      console.log(
        '5. not "undefined" string:',
        isNotUndefinedString,
        isNotUndefinedString ? '✓' : '✗',
      );

      const isNotNullString = finalCookieData !== 'null';
      console.log('6. not "null" string:', isNotNullString, isNotNullString ? '✓' : '✗');

      // 更嚴格的檢查
      if (
        isExists &&
        isString &&
        isNotEmpty &&
        isNotObjectString &&
        isNotUndefinedString &&
        isNotNullString
      ) {
        console.log('✓ All basic validations passed');

        // 額外檢查是否為有效的 JSON 格式
        const startsWithBracket = finalCookieData.startsWith('[');
        const startsWithBrace = finalCookieData.startsWith('{');
        const isValidJsonStart = startsWithBracket || startsWithBrace;

        console.log(
          '7. starts with "[" or "{":',
          isValidJsonStart,
          `(starts with "[": ${startsWithBracket}, starts with "{": ${startsWithBrace})`,
          isValidJsonStart ? '✓' : '✗',
        );

        if (isValidJsonStart) {
          console.log('✓ JSON format validation passed, attempting to parse...');
          const parsedData = JSON.parse(finalCookieData);
          console.log('Parsed data:', parsedData);
          console.log('Parsed data type:', typeof parsedData);

          // 確保解析後的資料是陣列
          const isArray = Array.isArray(parsedData);
          console.log('8. parsed data is array:', isArray, isArray ? '✓' : '✗');

          if (isArray) {
            data.value = parsedData;
            console.log('✅ Successfully loaded data from cookie:', parsedData);
          } else {
            console.warn('❌ Cookie data is not an array, initializing with empty array');
            console.log('Parsed data structure:', parsedData);
            data.value = [];
          }
        } else {
          console.warn('❌ Cookie data does not look like JSON, clearing...');
          console.log('First 50 chars of cookie data:', finalCookieData.substring(0, 50));
          // 使用原生方式清除 cookie
          document.cookie = `${COOKIE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
          data.value = [];
        }
      } else {
        console.log('❌ Basic validation failed, starting with empty array');
        console.log('Failed checks summary:');
        if (!isExists) console.log('  - Cookie data does not exist');
        if (!isString) console.log('  - Cookie data is not a string');
        if (!isNotEmpty) console.log('  - Cookie data is empty or only whitespace');
        if (!isNotObjectString) console.log('  - Cookie data is "[object Object]"');
        if (!isNotUndefinedString) console.log('  - Cookie data is "undefined"');
        if (!isNotNullString) console.log('  - Cookie data is "null"');
        data.value = [];
      }
    } catch (error) {
      console.error('❌ Failed to load data from cookie:', error);
      console.error('Problematic cookie data (native):', document.cookie);

      // 安全的錯誤處理
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack?.substring(0, 200) + '...',
        });
      } else {
        console.error('Unknown error type:', error);
      }

      // 使用原生方式清除損壞的 cookie
      document.cookie = `${COOKIE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
      data.value = [];
    }
    console.log('=== Cookie Loading Complete ===');
  };

  // 初始化時載入資料
  loadDataFromCookie();

  // 生成唯一的 category_id
  const generateCategoryId = (): string => {
    return 'cat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  // 新增分類
  const addCategory = (name: string, color: string): void => {
    const newCategory: CategoryItem = {
      category_name: name,
      category_id: generateCategoryId(),
      category_color: color,
      context: [],
    };

    data.value.push(newCategory);
    saveDataToCookie(); // 儲存到 cookie
  };

  // 根據 ID 查找分類
  const findCategoryById = (id: string): CategoryItem | undefined => {
    return data.value.find((category) => category.category_id === id);
  };

  // 根據 ID 刪除分類
  const removeCategoryById = (id: string): boolean => {
    const index = data.value.findIndex((category) => category.category_id === id);
    if (index !== -1) {
      data.value.splice(index, 1);
      saveDataToCookie(); // 儲存到 cookie
      return true;
    }
    return false;
  };

  // 編輯分類
  const updateCategory = (id: string, name: string, color: string): boolean => {
    const category = findCategoryById(id);
    if (category) {
      category.category_name = name;
      category.category_color = color;
      saveDataToCookie(); // 儲存到 cookie
      return true;
    }
    return false;
  };

  // 為指定分類新增 content 項目
  const addContentToCategory = (categoryId: string, label: string, content: string): boolean => {
    const category = findCategoryById(categoryId);
    if (category) {
      const newContent: ContentItem = {
        id: 'content_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        label,
        content,
        createdAt: new Date().toISOString(),
      };
      category.context.push(newContent);
      saveDataToCookie(); // 儲存到 cookie
      return true;
    }
    return false;
  };

  // 從指定分類移除 content 項目 (根據 ID)
  const removeContentFromCategory = (categoryId: string, contentId: string): boolean => {
    const category = findCategoryById(categoryId);
    if (category) {
      const index = category.context.findIndex((item) => item.id === contentId);
      if (index !== -1) {
        category.context.splice(index, 1);
        saveDataToCookie(); // 儲存到 cookie
        return true;
      }
    }
    return false;
  };

  // 舊方法保留以便向後兼容，但標記為棄用
  const addContextToCategory = (categoryId: string, contextItem: string): boolean => {
    return addContentToCategory(categoryId, 'Legacy Item', contextItem);
  };

  const removeContextFromCategory = (categoryId: string, contextItem: string): boolean => {
    const category = findCategoryById(categoryId);
    if (category) {
      const index = category.context.findIndex((item) => item.content === contextItem);
      if (index !== -1) {
        category.context.splice(index, 1);
        saveDataToCookie(); // 儲存到 cookie
        return true;
      }
    }
    return false;
  };

  // 取得所有分類
  const getAllCategories = (): CategoryItem[] => {
    return data.value;
  };

  // 清空所有資料
  const clearAllData = (): void => {
    data.value = [];
    saveDataToCookie(); // 儲存到 cookie
  };

  // 清除 cookie 資料（用於除錯）
  const clearCookieData = (): void => {
    try {
      // 使用原生方式清除 cookie
      document.cookie = `${COOKIE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
      data.value = [];
      console.log('Cookie data cleared successfully');
    } catch (error) {
      console.error('Failed to clear cookie data:', error);
    }
  };

  // 重置並重新初始化 cookie 資料
  const resetCookieData = (): void => {
    try {
      // 清除舊的 cookie
      document.cookie = `${COOKIE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;

      // 重新初始化為空陣列
      data.value = [];

      // 儲存乾淨的空陣列到 cookie
      saveDataToCookie();

      console.log('Cookie data reset and reinitialized successfully');
    } catch (error) {
      console.error('Failed to reset cookie data:', error);
    }
  };

  return {
    // 狀態
    data,

    // 動作
    addCategory,
    updateCategory,
    findCategoryById,
    removeCategoryById,
    addContentToCategory,
    removeContentFromCategory,
    addContextToCategory,
    removeContextFromCategory,
    getAllCategories,
    clearAllData,
    clearCookieData,
    resetCookieData,
  };
});
