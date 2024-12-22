import type { NextPage } from "next";
import Layout from "components/Layout";

const Lookup: NextPage = () => {

  return (
    <Layout
      tab="/network"
      page="/support"
    >
      <ul>
        <li>promotion / level range</li>
        <li>skill level / mastery</li>
        <li>module + stage</li>
        <li>potential</li>
        <li></li>
        <li>IS EQUAL TO</li>
        <li>IS LESS THAN</li>
        <li>IS MORE THAN</li>
        <li>IS BETWEEN</li>
      </ul>
    </Layout>
  );
};
export default Lookup;
