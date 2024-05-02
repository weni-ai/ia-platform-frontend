<template>
  <div class="sidebar">
    <UnnnicSidebar
      :expanded="collapse"
      :class="collapse ? 'sidebar-wrapper' : 'sidebar-wrapper--collapsed'"
    >
      <section
        class="unnic--clickable sidebar-wrapper__header"
        slot="header"
      >
        <div class="sidebar-wrapper__header__field">
          <div
            class="sidebar-wrapper__header__field__back"
            v-if="collapse"
          >
            <UnnnicIconSvg
              icon="keyboard-arrow-left-1"
              size="xs"
            />
            <span
              class="sidebar-wrapper__header__field__back__text"
              @click="routerHandle('home')"
              >{{ $t('webapp.menu.back_text') }}</span
            >
          </div>
          <div
            class="sidebar-wrapper__header__field__back--collapsed"
            v-else
          >
            <UnnnicToolTip
              :text="$t('webapp.menu.back_text')"
              enabled
              side="right"
            >
              <UnnnicIconSvg
                icon="keyboard-arrow-left-1"
                size="md"
                @click.native="routerHandle('home')"
                clickable
              />
            </UnnnicToolTip>
          </div>

          <div
            class="sidebar-wrapper__header__field__detail"
            v-show="collapse"
          >
            <span
              class="sidebar-wrapper__header__field__detail__title"
              :title="getCurrentRepository.name"
            >
              {{ getCurrentRepository.name }}
            </span>
            <div class="sidebar-wrapper__header__field__detail__created-by">
              <span
                class="sidebar-wrapper__header__field__detail__created-by__text"
              >
                {{ $t('webapp.menu.created_by') }}
              </span>
              <span
                class="sidebar-wrapper__header__field__detail__created-by__nick"
                :title="getCurrentRepository.owner__nickname"
              >
                {{ getCurrentRepository.owner__nickname }}
              </span>
            </div>
          </div>
        </div>

        <UnnnicSelect
          v-if="repositoryType === 'classifier'"
          :selected="getNameVersion"
          v-show="collapse"
          class="unnic--clickable sidebar-wrapper__header__select"
          size="sm"
          hasCloudyColor
          :placeholder="getNameVersion"
          v-model="selectedVersion"
          :optionsHeader="optionsHeader"
        >
          <option
            v-for="(version, index) in allVersions"
            :key="index"
            size="sm"
          >
            {{ version.name }}
          </option>
          <div
            slot="header"
            class="sidebar-wrapper__header__versions"
          ></div>
        </UnnnicSelect>
      </section>
      <section class="sidebar-wrapper__body">
        <UnnnicSidebarMenu v-if="repositoryType === 'content'">
          <UnnnicSidebarItem
            :icon="
              checkSelectedMenu('repository-content-bases')
                ? 'layout-dashboard-2'
                : 'layout-dashboard-1'
            "
            :text="$t('webapp.menu.content.bases')"
            :active="checkSelectedMenu('repository-content-bases')"
            :enableTooltip="!collapse"
            @click.native="
              setSelectMenu({
                name: 'repository-content-bases',
                dropdown: '',
                to: 'repository-content-bases',
                closeDrop: true,
              })
            "
            :class="[
              checkSelectedMenu('repository-content-bases')
                ? 'sidebar-wrapper__body--active'
                : 'sidebar-wrapper__body__element',
            ]"
          />
          <UnnnicSidebarItem
            :icon="
              checkSelectedMenu('repository-content-tests')
                ? 'check-square-2'
                : 'check-square-1'
            "
            :text="$t('webapp.menu.content.tests')"
            :active="checkSelectedMenu('repository-content-tests')"
            :enableTooltip="!collapse"
            @click.native="
              setSelectMenu({
                name: 'repository-content-tests',
                dropdown: '',
                to: 'repository-content-tests',
                closeDrop: true,
              })
            "
            :class="[
              checkSelectedMenu('repository-content-tests')
                ? 'sidebar-wrapper__body--active'
                : 'sidebar-wrapper__body__element',
            ]"
          />
          <UnnnicSidebarItem
            :icon="
              checkSelectedMenu('repository-content-api')
                ? 'phone-charger-1'
                : 'charger-1'
            "
            :text="$t('webapp.menu.content.api')"
            :active="checkSelectedMenu('repository-content-api')"
            :enableTooltip="!collapse"
            @click.native="
              setSelectMenu({
                name: 'repository-content-api',
                dropdown: '',
                to: 'repository-content-api',
                closeDrop: true,
              })
            "
            :class="[
              checkSelectedMenu('repository-content-api')
                ? 'sidebar-wrapper__body--active'
                : 'sidebar-wrapper__body__element',
            ]"
          />
          <UnnnicSidebarItem
            :icon="
              checkSelectedMenu('repository-content-adjustments')
                ? 'cog-2'
                : 'cog-1'
            "
            :text="$t('webapp.menu.content.adjustments')"
            :active="checkSelectedMenu('repository-content-adjustments')"
            :enableTooltip="!collapse"
            @click.native="
              setSelectMenu({
                name: 'repository-content-adjustments',
                dropdown: '',
                to: 'repository-content-adjustments',
                closeDrop: true,
              })
            "
            :class="[
              checkSelectedMenu('repository-content-adjustments')
                ? 'sidebar-wrapper__body--active'
                : 'sidebar-wrapper__body__element',
            ]"
          />
        </UnnnicSidebarMenu>

        <UnnnicSidebarMenu v-else-if="repositoryType === 'classifier'">
          <UnnnicSidebarItem
            :icon="
              checkSelectedMenu('repository-summary')
                ? 'layout-dashboard-2'
                : 'layout-dashboard-1'
            "
            :text="$t('webapp.menu.summary')"
            :enableTooltip="!collapse"
            :active="checkSelectedMenu('repository-summary')"
            @click.native="
              setSelectMenu({
                name: 'repository-summary',
                dropdown: '',
                to: 'repository-summary',
                closeDrop: true,
              })
            "
            :class="[
              checkSelectedMenu('repository-summary')
                ? 'sidebar-wrapper__body--active'
                : 'sidebar-wrapper__body__element',
            ]"
          />
          <section class="training-menu">
            <UnnnicSidebarItem
              v-if="getCurrentRepository.authorization.can_contribute"
              :icon="
                dropSelect === 'isTrainActive'
                  ? 'graph-status-circle-1-1'
                  : 'graph-status-circle-1'
              "
              :text="$t('webapp.menu.training')"
              :enableTooltip="!collapse"
              :active="dropSelect === 'isTrainActive'"
              :class="{
                'sidebar-wrapper__body--dropdown-open':
                  dropSelect === 'isTrainActive',
                'sidebar-wrapper__body__element': true,
              }"
              @click.native="openDropdown('isTrainActive')"
            >
            </UnnnicSidebarItem>
            <div
              v-show="dropSelect === 'isTrainActive' && collapse"
              class="sidebar-wrapper__body__item"
            >
              <UnnnicSidebarItem
                :text="$t('webapp.menu.train')"
                :class="[
                  checkSelectedMenu('repository-training')
                    ? 'sidebar-wrapper__body--active'
                    : 'sidebar-wrapper__body__element',
                ]"
                @click="
                  setSelectMenu({
                    name: 'repository-training',
                    to: 'repository-training',
                    closeDrop: false,
                  })
                "
              />
              <UnnnicSidebarItem
                :text="$t('webapp.menu.suggestion')"
                :class="[
                  checkSelectedMenu('repository-suggestion')
                    ? 'sidebar-wrapper__body--active'
                    : 'sidebar-wrapper__body__element',
                ]"
                @click="
                  setSelectMenu({
                    name: 'repository-suggestion',
                    to: 'repository-suggestion',
                    closeDrop: false,
                  })
                "
              />
            </div>
          </section>

          <UnnnicSidebarItem
            v-if="getCurrentRepository.authorization.can_contribute"
            :icon="
              checkSelectedMenu('repository-database') ? 'folder-2' : 'folder-1'
            "
            :text="$t('webapp.menu.database')"
            :enableTooltip="!collapse"
            :active="checkSelectedMenu('repository-database')"
            :class="[
              checkSelectedMenu('repository-database')
                ? 'sidebar-wrapper__body--active'
                : 'sidebar-wrapper__body__element',
            ]"
            @click="
              setSelectMenu({
                name: 'repository-database',
                to: 'repository-database',
                closeDrop: true,
              })
            "
          />

          <section class="evaluate-menu">
            <UnnnicSidebarItem
              v-if="getCurrentRepository.authorization.can_contribute"
              :icon="
                dropSelect === 'isTestsActive'
                  ? 'check-square-2'
                  : 'check-square-1'
              "
              :text="$t('webapp.menu.test')"
              :enableTooltip="!collapse"
              :active="dropSelect === 'isTestsActive'"
              :class="{
                'sidebar-wrapper__body--dropdown-open':
                  dropSelect === 'isTestsActive',
                'sidebar-wrapper__body__element': true,
              }"
              @click="openDropdown('isTestsActive')"
            >
            </UnnnicSidebarItem>
            <div
              v-show="dropSelect === 'isTestsActive' && collapse"
              class="sidebar-wrapper__body__item"
            >
              <UnnnicSidebarItem
                :text="$t('webapp.menu.test-manual')"
                :class="[
                  checkSelectedMenu('repository-test-manual')
                    ? 'sidebar-wrapper__body--active'
                    : 'sidebar-wrapper__body__element',
                ]"
                @click="
                  setSelectMenu({
                    name: 'repository-test-manual',
                    to: 'repository-test-manual',
                    closeDrop: false,
                  })
                "
              />
              <UnnnicSidebarItem
                :text="$t('webapp.menu.results')"
                :class="[
                  checkSelectedMenu('repository-results')
                    ? 'sidebar-wrapper__body--active'
                    : 'sidebar-wrapper__body__element',
                ]"
                @click="
                  setSelectMenu({
                    name: 'repository-results',
                    to: 'repository-results',
                    closeDrop: false,
                  })
                "
              />
            </div>
          </section>
          <UnnnicSidebarItem
            v-if="getCurrentRepository.authorization.can_contribute"
            :icon="
              checkSelectedMenu('repository-log')
                ? 'messages-bubble-3'
                : 'messages-bubble-1'
            "
            :text="$t('webapp.menu.inbox')"
            :enableTooltip="!collapse"
            :active="checkSelectedMenu('repository-log')"
            @click="
              setSelectMenu({
                name: 'repository-log',
                dropdown: '',
                to: 'repository-log',
                closeDrop: true,
              })
            "
            :class="[
              checkSelectedMenu('repository-log')
                ? 'sidebar-wrapper__body--active'
                : 'sidebar-wrapper__body__element',
            ]"
          />

          <UnnnicSidebarItem
            :icon="
              checkSelectedMenu(
                'repository-translations-status' || 'repository-translate',
              )
                ? 'translate-2'
                : 'translate-1'
            "
            :text="$t('webapp.menu.translation')"
            :enableTooltip="!collapse"
            :active="
              checkSelectedMenu(
                'repository-translations-status' || 'repository-translate',
              )
            "
            @click.native="
              setSelectMenu({
                name: 'repository-translations-status',
                dropdown: '',
                to: 'repository-translations-status',
                closeDrop: true,
              })
            "
            :class="[
              checkSelectedMenu(
                'repository-translations-status' || 'repository-translate',
              )
                ? 'sidebar-wrapper__body--active'
                : 'sidebar-wrapper__body__element',
            ]"
          />

          <UnnnicSidebarItem
            :icon="
              checkSelectedMenu('repository-integration')
                ? 'phone-charger-1'
                : 'charger-1'
            "
            :text="$t('webapp.menu.integration')"
            :enableTooltip="!collapse"
            :active="checkSelectedMenu('repository-integration')"
            @click="
              setSelectMenu({
                name: 'repository-integration',
                dropdown: '',
                to: 'repository-integration',
                closeDrop: true,
              })
            "
            :class="[
              checkSelectedMenu('repository-integration')
                ? 'sidebar-wrapper__body--active'
                : 'sidebar-wrapper__body__element',
            ]"
          />

          <UnnnicSidebarItem
            v-if="getCurrentRepository.authorization.can_contribute"
            :icon="checkSelectedMenu('repository-settings') ? 'cog-2' : 'cog-1'"
            :text="$t('webapp.menu.settings')"
            :enableTooltip="!collapse"
            :active="checkSelectedMenu('repository-settings')"
            :class="[
              checkSelectedMenu('repository-settings')
                ? 'sidebar-wrapper__body--active'
                : 'sidebar-wrapper__body__element',
            ]"
            @click="
              setSelectMenu({
                name: 'repository-settings',
                to: 'repository-settings',
                closeDrop: true,
              })
            "
          />
        </UnnnicSidebarMenu>
      </section>
      <div
        slot="footer"
        class="sidebar-wrapper__footer"
      >
        <UnnnicSidebarItem
          icon="expand-full-1"
          class="sidebar-wrapper__footer__text"
          :text="collapse ? $t('webapp.menu.hide') : $t('webapp.menu.expand')"
          :enableTooltip="!collapse"
          @click="collapseHandle()"
        />
      </div>
    </UnnnicSidebar>
    <span
      class="sidebar__divider"
      v-show="collapse"
    />
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex';
import CustomIcon from '@/components/shared/CustomIcon';

export default {
  name: 'SideBar',
  components: {
    CustomIcon,
  },
  data() {
    return {
      isSettingsActive: false,
      isTestsActive: false,
      isTranslationsActive: false,
      isTrainActive: false,
      selectedMenu: '',
      collapse: true,
      allVersions: [],
      dropSelect: '',
      selectedVersion: this.getNameVersion,
      optionsHeader: [
        {
          text: this.$t('webapp.dashboard.all_versions'),
          click: () =>
            this.routerHandle('repository-settings', {
              query: {
                tab: 'versions',
              },
            }),
        },
      ],
    };
  },
  computed: {
    ...mapGetters([
      'getCurrentRepository',
      'authenticated',
      'getUpdateVersionsState',
      'versionEnabled',
      'getNameVersion',
    ]),
    repositoryUUID() {
      if (!this.getCurrentRepository) return null;
      return this.getCurrentRepository.uuid;
    },
    repositoryType() {
      if (!this.getCurrentRepository) return null;
      return this.getCurrentRepository.repository_type;
    },
  },
  watch: {
    repositoryUUID() {
      if (this.authenticated) {
        this.getAllVersions();
      }
    },
    authenticated() {
      if (this.authenticated) {
        this.getAllVersions();
      }
    },
    selectedVersion() {
      let defaultVersions;

      try {
        defaultVersions =
          JSON.parse(localStorage.getItem('default-versions')) || {};
      } catch {
        defaultVersions = {};
      }

      defaultVersions[this.repositoryUUID] = this.selectedVersion;
      localStorage.setItem('default-versions', JSON.stringify(defaultVersions));

      this.handleVersion(this.selectedVersion);
    },
    getUpdateVersionsState() {
      if (this.getUpdateVersionsState) {
        this.getAllVersions();
        this.setUpdateVersionsState(false);
      }
    },
  },
  mounted() {
    this.getAllVersions();
    this.setInitialSelectedMenu();
  },
  methods: {
    ...mapActions([
      'getFirstFiveVersions',
      'setRepositoryVersion',
      'setUpdateVersionsState',
    ]),
    async getAllVersions() {
      if (!this.repositoryUUID) return;
      this.isLoading = true;
      try {
        const response = await this.getFirstFiveVersions(this.repositoryUUID);
        this.allVersions = response.data.results;
      } finally {
        this.isLoading = false;
      }

      let defaultVersions;

      try {
        defaultVersions =
          JSON.parse(localStorage.getItem('default-versions')) || {};
      } catch {
        defaultVersions = {};
      }

      if (defaultVersions[this.repositoryUUID]) {
        this.selectedVersion = defaultVersions[this.repositoryUUID];
      }
    },
    handleVersion(value) {
      const versionResult = this.allVersions.find(
        (option) => option.name === value,
      );
      const version = {
        id: versionResult.id,
        name: versionResult.name,
      };
      this.setRepositoryVersion({
        version,
        repositoryUUID: this.repositoryUUID,
      });
    },
    routerHandle(path, opts = {}) {
      if (
        path !== this.$router.currentRoute.name ||
        path === 'repository-settings'
      ) {
        this.$router.push({
          name: `${path}`,
          ...opts,
        });
      }
    },
    setInitialSelectedMenu() {
      this.selectedMenu = this.$router.currentRoute.name;
      if (
        this.$router.currentRoute.name === 'repository-settings' ||
        this.$router.currentRoute.name === 'repository-versions'
      ) {
        this.dropSelect = 'isSettingsActive';
      }
      if (
        this.$router.currentRoute.name === 'repository-translate' ||
        this.$router.currentRoute.name === 'repository-translations-status'
      ) {
        this.dropSelect = 'isTranslationsActive';
      }
      if (
        this.$router.currentRoute.name === 'repository-test-automatic' ||
        this.$router.currentRoute.name === 'repository-test-manual' ||
        this.$router.currentRoute.name === 'repository-results'
      ) {
        this.dropSelect = 'isTestsActive';
      }
      if (
        this.$router.currentRoute.name === 'repository-training' ||
        this.$router.currentRoute.name === 'repository-suggestion'
      ) {
        this.dropSelect = 'isTrainActive';
      }
    },
    checkSelectedMenu(menu) {
      return menu === this.selectedMenu;
    },
    openDropdown(value) {
      this.dropSelect = value;
      this.selectedMenu = '';
    },
    setSelectMenu(option) {
      this.selectedMenu = option.name;
      if (option.to) {
        this.routerHandle(option.to);
      }
      if (option.closeDrop) {
        this.dropSelect = option.dropdown;
      }
    },
    collapseHandle() {
      this.$emit('collapse');
      this.collapse = !this.collapse;
    },
  },
};
</script>
<style lang="scss">
@import '@/assets/scss/utilities.scss';
@import '@/assets/scss/variables.scss';
@import '@weni/unnnic-system/dist/unnnic.css';
@import '@weni/unnnic-system/src/assets/scss/unnnic.scss';

.sidebar {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  opacity: 1;
  font-family: $font-family;
  display: flex;

  .sidebar-wrapper {
    z-index: 10;
    background-color: $unnnic-color-background-snow;
    height: 100%;
    width: $menu-expanded-size;
    transition: width 0.1s;
    font-family: $font-family;
    border-top-left-radius: $unnnic-border-radius-md;
    overflow-y: auto;

    &__header {
      &__select {
        z-index: 10;
        padding-bottom: $unnnic-spacing-stack-sm;
        .dropdown > div > input {
          height: auto;
        }

        .unnnic-select__header::after {
          margin: 0;
        }

        .dropdown-data .unnnic-select__options > div {
          max-height: 180px;

          .unnnic-select__options__scroll-area {
            overflow: hidden;
          }
        }
      }
      &__versions {
        cursor: pointer;
      }
      &__field {
        &__back {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding-bottom: $unnnic-spacing-stack-sm;

          &--collapsed {
            padding-left: 0.38rem;
            padding-bottom: $unnnic-spacing-stack-sm;
            color: $unnnic-color-neutral-cloudy;
          }

          &__text {
            cursor: pointer;
            font-family: $unnnic-font-family-secondary;
            color: $unnnic-color-neutral-cloudy;
            font-weight: $unnnic-font-weight-regular;
            font-size: $unnnic-font-size-body-gt;
            line-height: ($unnnic-line-height-md + $unnnic-font-size-body-gt);
            padding-left: 0.3rem;
          }
        }

        &__detail {
          padding-bottom: $unnnic-spacing-stack-sm;
          &__title {
            font-family: $unnnic-font-family-secondary;
            color: $unnnic-color-brand-weni-soft;
            font-weight: $unnnic-font-weight-bold;
            font-size: $unnnic-font-size-body-gt;
            line-height: (
              $unnnic-line-height-small + $unnnic-font-size-body-gt
            );
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            display: block;
            max-width: 9.5625rem;
          }
          &__created-by {
            font-family: $unnnic-font-family-secondary;
            font-size: $unnnic-font-size-body-md;
            font-weight: $unnnic-font-weight-regular;
            line-height: (
              $unnnic-line-height-small + $unnnic-font-size-body-md
            );
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            &__text {
              color: $unnnic-color-neutral-cloudy;
            }
            &__nick {
              color: $unnnic-color-neutral-dark;
              font-weight: $unnnic-font-weight-bold;
            }
          }
        }
      }
    }

    &__body {
      margin-top: -1.9rem;

      &__element {
        color: $unnnic-color-neutral-cloudy;
        &:hover {
          background-color: $unnnic-color-background-sky;
        }
      }

      &--dropdown-open {
        background-color: $unnnic-color-background-sky;
        color: $unnnic-color-neutral-cloudy;
        font-weight: $unnnic-font-weight-bold;
      }

      &--active {
        background-color: $unnnic-color-background-sky;
        color: $unnnic-color-neutral-cloudy;
        font-weight: $unnnic-font-weight-bold;

        .unnnic-icon {
          color: $unnnic-color-brand-weni;
        }
      }

      &__item {
        margin-left: $unnnic-inline-md;
        margin-bottom: $unnnic-spacing-stack-xs;
        border-bottom: 1px solid $unnnic-color-neutral-soft;

        > div > div > .unnnic-side-bar-item__icon {
          display: none;
        }
      }

      &__divider {
        border-bottom: $unnnic-border-width-thinner solid
          $unnnic-color-neutral-soft;
      }
    }

    &--collapsed {
      height: 100%;
      padding: 1rem;
      transition: width 0.1s;
      width: $menu-collapsed-size;
      background-color: $unnnic-color-background-snow;
      border-right: $unnnic-border-width-thinner solid
        $unnnic-color-neutral-soft;
    }
    &__footer {
      &__text {
        color: $unnnic-color-neutral-cloudy;
      }
    }
  }
  &__divider {
    border-left: 1px solid $unnnic-color-neutral-soft;
    height: 93%;
    width: 0.5px;
    margin: auto;
  }
}

.icon-list {
  margin: 0.5rem 0;
  cursor: pointer;
}
.icon-list:hover {
  color: $unnnic-color-brand-weni-soft;
}
</style>
