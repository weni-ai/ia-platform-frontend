import nexusaiAPI from '@/api/nexusaiAPI';
import { toValue, watch } from 'vue';
import { createStore } from 'vuex';
import globalStore from '@/store';
import i18n from '@/utils/plugins/i18n';

const store = createStore({
  state() {
    return {
      itemsBeingProcessed: [],
    };
  },
});

function addItemBeingProcessed(type, itemUuid, item, contentBaseUuid) {
  const alreadyIn = store.state.itemsBeingProcessed.find(
    ({ uuid }) => uuid === itemUuid,
  );

  if (!alreadyIn) {
    store.state.itemsBeingProcessed.push({
      type,
      uuid: itemUuid,
      item,
      contentBaseUuid,
    });
  }
}

function removeFirstItemBeingProcessed() {
  return store.state.itemsBeingProcessed.shift();
}

function moveFirstItemBeingProcessedToTheEnd() {
  const firstItem = removeFirstItemBeingProcessed();
  store.state.itemsBeingProcessed.push(firstItem);
}

async function checkIfItemHasAlreadyBeenProcessed() {
  const { type, uuid, item, contentBaseUuid } =
    store.state.itemsBeingProcessed.at(0);

  await nexusaiAPI.intelligences.contentBases[type]
    .read({
      contentBaseUuid,
      uuid,
    })
    .then(({ data }) => {
      if (data.status === 'success') {
        removeFirstItemBeingProcessed();

        item.status = 'uploaded';
        item.file_name = data.file_name;
        item.created_at = data.created_at;

        if (type === 'files') {
          successMessage();
        }
      } else if (data.status === 'fail') {
        removeFirstItemBeingProcessed();

        item.status = data.status;
      } else {
        moveFirstItemBeingProcessedToTheEnd();
      }
    })
    .catch(() => {
      moveFirstItemBeingProcessedToTheEnd();
    });

  if (store.state.itemsBeingProcessed.length >= 1) {
    setTimeout(checkIfItemHasAlreadyBeenProcessed, 3000);
  }
}

watch(
  () => store.state.itemsBeingProcessed.length,
  (current, previous) => {
    const hasBeenAddedSomeItem = previous === 0 && current >= 1;

    if (hasBeenAddedSomeItem) {
      setTimeout(checkIfItemHasAlreadyBeenProcessed, 3000);
    }
  },
);

function successMessage() {
  globalStore.state.alert = {
    type: 'success',
    text: i18n.global.t(
      'content_bases.files.content_of_the_files_has_been_added',
    ),
  };
}

export function useIndexingProcess(items, type, contentBaseUuid) {
  watch(
    () => items,
    (items) => {
      toValue(items)
        .filter(({ status }) => status === 'processing')
        .forEach((item) => {
          addItemBeingProcessed(type, item.uuid, item, contentBaseUuid);
        });
    },
    { deep: true },
  );
}
