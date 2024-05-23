export default {
  stringify(params) {
    return new URLSearchParams(params).toString();
  },
};
