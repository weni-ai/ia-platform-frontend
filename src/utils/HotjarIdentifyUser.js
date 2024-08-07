import axios from 'axios';

export function HotjarIdentifyUser({ token }) {
  const keycloak = {
    server: runtimeVariables.get('KEYCLOAK_SERVER'),
    realm: runtimeVariables.get('KEYCLOAK_REALM'),
  };

  const isThereAMissingKeycloakSettingValue = Object.values(keycloak).some(
    (value) => !value,
  );

  if (isThereAMissingKeycloakSettingValue) {
    return;
  }

  axios
    .get(
      `https://${keycloak.server}/auth/realms/${keycloak.realm}/protocol/openid-connect/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    .then(({ data: { email, name, locale } }) => {
      window.hj?.('identify', email, {
        email,
        name,
        locale,
      });
    });
}
