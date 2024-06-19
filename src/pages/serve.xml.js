import axios from "axios";

function generateSiteMap(products) {
    const escapeXmlUnsafeCharacters = (str) => {
        return str?.replace(/[<>&'"]/g, function (c) {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
            }
        });
    };
    return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     ${products.results
        .map(product => {
            return `
       <url>
           <loc>${process.env.NEXT_PUBLIC_SITE_URL}/${product.category_name.replace(/\s+/g, '-').toLowerCase()}/${escapeXmlUnsafeCharacters(product.title?.replace(/\s+/g, '-'))}-${product.id}</loc>
           <lastmod>${product.updated_at}</lastmod>
           <priority>0.7</priority>
       </url>
     `;
        })
        .join('')}
   </urlset>
 `;
}

// Sitemap component
function Sitemap() {}

// @ts-ignore
export async function getServerSideProps({ res }) {

    const endpoint = `${process.env.NEXT_PUBLIC_API_SERVER}/api/v1/product`;
    const productsResponse= await axios.get(endpoint);
    const products = productsResponse.data;
    const productEndpoint = `${process.env.NEXT_PUBLIC_API_SERVER}/api/v1/product/?limit=${products.count}`;
    const allProductsResponse= await axios.get(productEndpoint);
    const allProducts = allProductsResponse.data;
    const sitemap = generateSiteMap(allProducts);

    res.setHeader('Content-Type', 'text/xml');
    // we send the XML to the browser
    res.write(sitemap);
    res.end();

    return {
        props: {},
    };
}

export default Sitemap;

