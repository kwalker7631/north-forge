export const createRenderGuard = () => {
  let token = 0;

  return {
    next() {
      token += 1;
      return token;
    },
    isCurrent(checkToken) {
      return checkToken === token;
    },
  };
};
