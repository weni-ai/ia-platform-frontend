<template>
  <footer>
    <div class="background" />
    <div class="wrapper">
      <div class="footer-content">
        <div class="footer-items">
          <div class="footer-item footer-brand">
            <img
              :src="weniDynamicLogo"
              alt="Weni Inteligência Artificial"
            />
            <div>Webapp v{{ version }}</div>
          </div>
          <ul class="footer-item">
            <li>
              <RouterLink to="/terms"
                >{{ $t('webapp.layout.terms_conditions') }}
              </RouterLink>
            </li>
          </ul>
          <ul class="footer-item footer-sociallist">
            <li class="footer-sociallist-item">
              <a
                href="https://www.facebook.com/bothub.it"
                target="_blank"
                ><BIcon icon="facebook"
              /></a>
            </li>
            <li class="footer-sociallist-item">
              <a
                href="https://github.com/Ilhasoft/bothub/"
                target="_blank"
                ><BIcon icon="github"
              /></a>
            </li>
          </ul>
        </div>
        <div class="footer-items">
          <h4 class="footer-title">{{ $t('webapp.layout.contact_us') }}</h4>
          <div class="footer-section-item">
            <p>Rua José Pontes de Magalhães 70,</p>
            <p>Empresarial JTR - Ed. Austrália, Sala 07</p>
            <p>Jatiúca - Maceió/AL</p>
          </div>
          <div class="footer-section-item">
            <p>+55 82 3022.5978</p>
          </div>
        </div>
      </div>
      <div class="footer-license">
        <p class="has-text-centered">
          {{ $t('webapp.layout.footer_license') }}
        </p>
      </div>
    </div>
  </footer>
</template>

<script>
import I18n from '@/utils/plugins/i18n';

export default {
  name: 'SiteFooter',
  data() {
    return {
      version: runtimeVariables.get('VUE_APP_VERSION'),
    };
  },
  components: {
    I18n,
  },
  computed: {
    weniDynamicLogo() {
      if (I18n.locale === 'pt-BR') {
        return '/weni-logo-white.svg';
      }
      return '/weni-logo-white-en.svg';
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';
@import '~@/assets/scss/utilities.scss';

footer {
  width: 100%;
  color: $color-white;

  ul {
    li {
      a {
        color: $color-white;
        transition: color 0.2s ease;

        &:hover {
          color: $color-grey-light;
        }
      }
    }
  }

  .background {
    background-image: url('@/assets/imgs/mask-footer.svg');
    background-repeat: no-repeat;
    background-size: 100%;
    height: 30vh;
  }

  .wrapper {
    width: 100%;
    background-color: $color-primary;
    margin: 0;
    @media screen and (max-width: $mobile-width *1.2) {
      margin-top: -16vh;
      text-align: center;
    }
  }

  .footer {
    &-content {
      display: flex;
      justify-content: space-around;
      width: 100%;
      margin-bottom: 1rem;

      @media screen and (max-width: 50em) {
        flex-direction: column;
        justify-content: space-around;
        margin: 1rem;
      }
    }

    &-items {
      margin-top: 1rem;
    }

    &-item {
      margin-bottom: 15px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    &-brand {
      img {
        width: 160px;
        margin-bottom: 0.5rem;
      }
    }

    &-title {
      font-weight: $font-weight-bolder;
      font-size: 1.2rem;
      text-transform: uppercase;
      margin-bottom: 0.375rem;
    }

    &-section-item {
      margin-bottom: 0.5rem;
    }

    &-has-input {
      input {
        outline: none;
        border: none;
        box-shadow: none;
      }
    }

    &-sociallist {
      display: flex;
      @media screen and (max-width: $mobile-width) {
        justify-content: center;
      }

      &-item {
        $size: 36px;

        width: $size;
        height: $size;
        line-height: $size;
        border-radius: 50%;
        overflow: hidden;
        margin-right: 4px;

        &:last-child {
          margin-right: 0;
        }

        a {
          display: block;
          width: 100%;
          height: 100%;
          color: $color-primary;
          background-color: $color-white;
          text-align: center;
          transition: background-color 0.2s ease;

          &:hover {
            color: $color-primary;
            background-color: $color-white;
          }

          .icon {
            display: block;
            width: $size;
            height: $size;
          }
        }
      }
    }

    &-license {
      border-top: 1px solid $color-white;
      width: 80%;
      padding: 16px 0;
      margin: auto;
    }
  }
}
</style>
