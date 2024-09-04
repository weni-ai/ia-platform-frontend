import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';

export const useAlertStore = defineStore('alert', () => {
  const id = ref(0);
  const alert = reactive({});

  function addAlert({ text, type }) {
    id.value += 1;

    alert.text = text;
    alert.type = type;
  }

  function closeAlert() {
    alert.text = '';
    alert.type = '';
  }

  return {
    id,
    data: alert,

    add: addAlert,
    close: closeAlert,
  };
});
