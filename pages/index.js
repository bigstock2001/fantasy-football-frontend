// pages/index.js
export async function getServerSideProps({ req }) {
  const hasSession =
    req.cookies?.ffd_session ||
    req.cookies?.ffd_token ||
    req.cookies?.token ||
    req.cookies?.session;

  return {
    redirect: {
      destination: hasSession ? "/locker-room" : "/login-required?next=/locker-room",
      permanent: false,
    },
  };
}

export default function Index() {
  return null;
}
