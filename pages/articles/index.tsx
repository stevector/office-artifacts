import {
  Article,
  PCCConvenienceFunctions,
  Site,
} from "@pantheon-systems/pcc-react-sdk";
import { NextSeo } from "next-seo";
import queryString from "query-string";
import ArticleList from "../../components/article-list";
import Layout from "../../components/layout";
import { PAGE_SIZE } from "../../constants";
import { GetServerSidePropsContext } from "next";


async function fetchNextPages(cursor?: string | null | undefined) {
  const url = queryString.stringifyUrl({
    url: "/api/utils/paginate",
    query: {
      pageSize: PAGE_SIZE,
      cursor: cursor,
    },
  });

  const response = await fetch(url);
  const { data, cursor: newCursor } = await response.json();
  return {
    data,
    newCursor,
  };
}

interface Props {
  articles: Article[];
  totalCount: number;
  cursor: string;
  site: Site;
}

export default function ArticlesListTemplate({
  articles,
  totalCount,
  cursor,
  site,
}: Props) {
  return (
    <Layout>
      <NextSeo title="Articles" description="Articles" />

      <ArticleList
        headerText="Articles"
        articles={articles}
        cursor={cursor}
        totalCount={totalCount}
        fetcher={fetchNextPages}
        site={site}
      />
    </Layout>
  );
}

export async function getServerSideProps({ res }: GetServerSidePropsContext) {
  // Fetch the site and articles in parallel
  const [site, { data: articles, totalCount, cursor }] = await Promise.all([
    PCCConvenienceFunctions.getSite(),
    PCCConvenienceFunctions.getPaginatedArticles({
      pageSize: PAGE_SIZE,
    }),
  ]);


  // Use a low s-maxage but I high stale-while-revalidate
  // to increase the likelihood of both
  // 1. a fast response from the CDN (thanks to serving stale for up to 24 hours)
  // 2. New content getting displayed quickly
  // (since the CDN should only consider a response fresh for 5 seconds)
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=5, stale-while-revalidate=86400'
  );

  return {
    props: {
      articles,
      cursor,
      totalCount,
      site,
    },
  };
}
