<template>
  <PaginatedList
    :list="list"
    :itemComponent="item"
    :perPage="perPage"
    :emptyMessage="$t('webapp.orgs.no_orgs')"
    class="org-list"
  />
</template>

<script>
import PaginatedList from '@/components/shared/PaginatedList';
import OrgListItem from '@/components/org/OrgListItem';
import { mapActions } from 'vuex';

export default {
  name: 'OrgList',
  components: {
    PaginatedList,
  },
  data() {
    return {
      item: OrgListItem,
      list: null,
      perPage: 10,
    };
  },
  mounted() {
    this.loadOrgs();
  },
  methods: {
    ...mapActions(['getAllOrgs']),
    async loadOrgs() {
      this.list = await this.getAllOrgs();
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/variables.scss';
.org-list {
  display: flex;
  flex-wrap: wrap;

  @media screen and (max-width: $mobile-width) {
    margin: 0 1rem 0 1rem;
  }

  @media screen and (max-width: $small-mobile-width) {
    margin: 0 1rem 0 1rem;
  }
}
</style>
