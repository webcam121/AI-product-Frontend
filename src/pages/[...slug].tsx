import React from 'react';
import axios from 'axios';
import { Meta } from '@/layouts/Meta';
import { Main } from '@/templates/Main';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import Grid from "@mui/material/Grid";
import ProductCard from "@/components/card";
import https from "https";
import Cookies from "js-cookie";

type productDetailType = {
    id: number,
    image_url : string,
    title: string,
    description: string,
    url: string,
    category_name: string,
    category_id: number,
}

type detailProps = {
    productDetail: productDetailType,
    alternative_list: any
}


const ProductDetail = ({productDetail, alternative_list}: detailProps) => {

    const handleLink = async (e: any, id : number) => {
        e.preventDefault();
        const uid = Cookies.get('uid');
        const click_source = window.location.href;
        const endpoint = `${process.env.NEXT_PUBLIC_API_SERVER}/api/v1/product/${id}/click?uid=${uid}&click_source=${click_source}`;
        try {
            const response = await axios.get(endpoint, {httpsAgent: new https.Agent({ rejectUnauthorized: false })} );
            window.open(response.data);
        } catch(error) {
            console.error("There was an Error!", error);
        }
    }

    return (
        <Main meta={<Meta title="AI Product Detail" description="AI Product Detail" />}>
            <div className={'flex flex-col h-fit mx-auto text-white justify-center max-w-screen-xl bg-[#1F1D2B] pt-20 px-5'}>
                <Breadcrumbs separator="›" aria-label="breadcrumb" sx={{color:'#FFFFFF'}}>
                    <Link underline="hover" key="1" color="inherit" href="/" sx={{ border: 'none'}}>
                        Home
                    </Link>,
                    <Link
                        underline="hover"
                        key="2"
                        color="inherit"
                        href={`/?category=${productDetail.category_id}`}
                        sx={{ border: 'none'}}
                    >
                        {productDetail.category_name}
                    </Link>,
                    <span key="3" >
                        {productDetail.title}
                    </span>
                </Breadcrumbs>
                <div className={"mt-5 flex xs:flex-col md:flex-row justify-center"}>
                    <div className={"xs:w-full md:w-1/2 md:mr-7 md:px-0"}>
                        <img src={productDetail.image_url ? productDetail.image_url: '/assets/images/placeholder.svg'} alt={productDetail.title} className={'w-full'}/>
                    </div>
                    <div className={'xs:w-full md:w-1/2 md:ml-7 xs:mt-5 md:mt-0 md:px-0 flex flex-col justify-start'}>
                        <div className={'flex flex-row justify-between items-center'}>
                            <div className={'flex flex-row items-center justify-center'}>
                                <span className={'text-2xl mr-3 font-bold'}>
                                {productDetail.title}
                                </span>
                                <a href={''} target={'_blank'} className={'cursor-pointer border-none text-[#9AA0B9]'}><OpenInNewOutlinedIcon className={'w-6 h-6'} onClick={(e) => handleLink(e,productDetail.id)}/></a>
                            </div>
                        </div>
                        <span className={'text-sm text-[#9AA0B9] my-4'}>
                            {productDetail.description}
                        </span>
                        <span className={'text-sm text-white px-2 border-[1px] rounded-md border-[#323542] w-fit bg-[#40465F] text-center'}>{productDetail.category_name}</span>
                    </div>
                </div>
                <div className={`flex flex-col mt-10 justify-center w-full`}>
                    <span className={'text-base text-white border-b-[1px] pb-1 border-[#9AA0B9] border-opacity-50 mb-5'}>Alternative AI tools for {productDetail.title}</span>
                    <Grid container spacing={3}>
                        {alternative_list.results.slice(0,3).map((product: any) => (
                            <Grid item xs={12} sm={6} lg={4} key={product.id}>
                                <ProductCard {...product} />
                            </Grid>
                        ))}
                    </Grid>
                </div>
            </div>
        </Main>
    );
}
// @ts-ignore
export async function getServerSideProps({query}) {
    const product_detail = query.slug[1]? query.slug[1].split('-'): '';
    const product_id = product_detail ? product_detail[product_detail?.length -1] : '';
    const agent = new https.Agent({
        rejectUnauthorized: false
    });
    const detail_endpoint = `${process.env.NEXT_PUBLIC_API_SERVER}/api/v1/product/${product_id}`;
    const detail = await axios.get(detail_endpoint, {httpsAgent: agent});
    const productDetail = detail.data;
    const list_endpoint = `${process.env.NEXT_PUBLIC_API_SERVER}/api/v1/product/?category=${productDetail.category_id}`;
    const list = await axios.get(list_endpoint, {httpsAgent: agent});
    const alternative_list = list.data;
    return {props: { productDetail, alternative_list }}
}

export default ProductDetail;