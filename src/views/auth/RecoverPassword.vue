<template>
  <BoardingLayout>
    <div class="recover-password">
      <div class="recover-password__content">
        <div class="recover-password__content__field">
          <div class="recover-password__content__field__forms">
            <h1>{{ $t('webapp.recover_form.recover') }}</h1>
            <ForgotPasswordForm />
          </div>
        </div>
      </div>
    </div>
  </BoardingLayout>
</template>

<script>
import BoardingLayout from '@/components/user/BoardingLayout';
import FormGenerator from '@/components/form-generator/FormGenerator';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import LoginForm from '@/components/auth/LoginForm';

export default {
  name: 'SignIn',
  components: {
    BoardingLayout,
    FormGenerator,
    LoginForm,
    ForgotPasswordForm,
  },
  methods: {
    onAuthenticated() {
      this.$router.push('/home');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';

.recover-password {
  &__content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 5.5rem);

    &__field {
      width: 36rem;
      max-height: 20.938rem;

      &__forms {
        padding: 2rem 4.5rem;
        background-color: $color-white;
        box-shadow: 0px 3px 6px #00000029;

        h1 {
          color: $color-primary;
          font-family: $font-family;
          font-size: 2.563rem;
          text-align: center;
        }
      }
      @media screen and (max-width: 40em) {
        width: 30rem;
      }
    }
  }
}
</style>
