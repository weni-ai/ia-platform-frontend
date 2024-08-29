import { ref } from 'vue';

export function usePagination({ load, transform }) {
  const status = ref(null);
  const next = ref(null);
  const data = ref([]);
  let overwrittenParams = {};

  function overwriteParams(params) {
    overwrittenParams = params;
  }

  function reset() {
    status.value = null;
    next.value = null;
    data.value = [];
    overwrittenParams = {};
  }

  async function loadNext() {
    status.value = 'loading';

    const { data: responseData } = await load.request({
      ...load.params,
      ...overwrittenParams,
      next: next.value,
    });

    data.value = data.value.concat(
      responseData.results
        .filter(
          ({ uuid }) =>
            !data.value.some((alreadyIn) => alreadyIn.uuid === uuid),
        )
        .map(transform ? transform : (item) => item),
    );

    status.value = null;
    next.value = responseData.next;

    if (!responseData.next) {
      status.value = 'complete';
    }
  }

  function addItem(item) {
    data.value.unshift(item);
  }

  function removeItem({ uuid }) {
    data.value = data.value.filter((item) => item.uuid !== uuid);
  }

  return {
    status,
    next,
    data,
    reset,
    loadNext,
    addItem,
    removeItem,
    overwriteParams,
  };
}
