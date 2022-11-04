const config = {
  siteTitle: "Krooster",
  siteUrl: "https://krooster.com/",
  siteDescription:
    "A collection and progress tracker for Arknights, a game developed by Hypergryph.",
  tabs: {
    "/data": {
      title: "Data",
      description: "Data things",
      pages: {
        "/input": {
          title: "Input",
          description: "Enter data about owned operators.",
        },
        "/view": {
          title: "Collection",
          description: "View a summary of operator data.",
        }
      }
    },
    "/account": {
      title: "Account",
      description: "Account for things",
      pages: {
        "/profile": {
          title: "Profile",
          description: "Pro files",
          requireLogin: true,
        },
        "/settings": {
          title: "Settings",
          description: "Make changes to account details.",
          requireLogin: true,
        }
      }
    },
    "/network": {
      title: "Network",
      description: "Networking opportunites",
      pages: {
        "/lookup": {
          title: "Lookup",
          description: "Look up people",
        },
      }
    },
  },
};
export default config;