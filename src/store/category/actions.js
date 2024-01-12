import category from '@/api/category';

export default {
  async getAllCategories(store) {
    if (store.state.allCategories) {
      return { data: store.state.allCategories };
    }

    const response = await category.getAll();

    if (response.data) {
      store.state.allCategories = response.data;
    }

    return response;
  },
};
