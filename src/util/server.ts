const url = (env: string | undefined) => {
  switch (env) {
    case "production":
      return "https://www.krooster.com";
    case "preview":
      return "https://ak-roster-git-v3-neeia.vercel.app";
    default:
      return "http://localhost:3000";
  }
};

export const server = url(process.env.NODE_ENV);
