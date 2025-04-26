import NextHead from "next/head";
import imageBase from "util/imageBase";

interface Props {
  url: string;
  title: string;
  description: string;
  themeColor?: string;
  children?: React.ReactNode;
}

const Head = (props: Props) => {
  const { url, title, description, themeColor = "#FFD440", children } = props;

  return (
    <>
      <NextHead>
        <title>{title}</title>
        <meta key="url" property="og:url" content={url} />
        <meta key="title" property="og:title" content={title} />
        <meta key="description" name="description" content={description} />
        <meta key="ogdescription" property="og:description" content={description} />
        <link rel="apple-touch-icon" sizes="180x180" href={`${imageBase}/assets/favicon/apple-touch-icon.png`} />
        <link rel="icon" type="image/png" sizes="32x32" href={`${imageBase}/assets/favicon/favicon-32x32.png`} />
        <link rel="icon" type="image/png" sizes="16x16" href={`${imageBase}/assets/favicon/favicon-16x16.png`} />
        <link rel="manifest" href="/manifest.json" />
        <style>
          @import
          url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap');
        </style>
        <meta name="theme-color" content={themeColor} />
        {/* <meta name="robots" content="noindex,nofollow" /> */}
        {children}
      </NextHead>
    </>
  );
};

export default Head;
