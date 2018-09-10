import request from '../request';


export default class List {
  constructor(initial) {
    this.itemsList = [];
    this.deletions = [];
    this.initial = initial;
    this.nextEntryPoint = initial;
    this.loading = false;
  }

  get items() {
    return this.itemsList
      .map((data, i) => ({
        id: data.id || data.uuid || data.pk || data.key || i,
        data: Object.assign(
          {},
          data,
        ),
      }))
      .filter(item => !this.deletions.includes(item.id));
  }

  set items(value) {
    this.itemsList = value;
  }

  get hasNext() {
    return !this.loading && !!this.nextEntryPoint;
  }

  async next() {
    this.loading = true;
    const response = await request.$http.get(this.nextEntryPoint);
    this.nextEntryPoint = response.data.next;
    this.items = this.itemsList.concat(response.data.results);
    this.loading = false;
    return this.items;
  }

  get empty() {
    return !this.loading && this.items.length === 0;
  }

  async reset() {
    this.items = [];
    this.deletions = [];
    this.nextEntryPoint = this.initial;
  }

  delete(id) {
    this.deletions.push(id);
    return id;
  }
}