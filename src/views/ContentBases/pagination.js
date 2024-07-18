import { ref } from 'vue';

export function usePagination({ load, transform }) {
  const status = ref(null);
  const next = ref(null);
  const data = ref([]);

  async function loadNext() {
    status.value = 'loading';

    const { data: dataContentBases } = await load.request({
      ...load.params,
      next: next.value,
    });

    data.value = data.value.concat(
      dataContentBases.results
        .filter(
          ({ uuid }) =>
            !data.value.some((alreadyIn) => alreadyIn.uuid === uuid),
        )
        .map(transform ? transform : (item) => item),
    );

    status.value = null;
    next.value = dataContentBases.next;

    if (!dataContentBases.next) {
      status.value = 'complete';
    }
  }

  function addItem(item) {
    data.value.push(item);
  }

  function removeItem({ uuid }) {
    data.value = data.value.filter((item) => item.uuid !== uuid);
  }

  return {
    status,
    next,
    data,
    loadNext,
    addItem,
    removeItem,
  };
}
