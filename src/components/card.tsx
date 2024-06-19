import React from 'react';
import Link from 'next/link';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import Categories from "@/utils/category";
import axios from "axios";
import https from "https";
import Cookies from "js-cookie";

type productType = {
    id: number,
    image_url : string,
    title: string,
    description: string,
    url: string,
    category_name: string,
    click: number,
}

function ProductCard(product: productType) {
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
    // @ts-ignore
    return (
        <Link href={`/${product.category_name.replace(/\s+/g, '-').toLowerCase()}/${product.title.replace(/\s+/g, '-')}-${product.id}`}>
            <Card sx={{ maxWidth: 400, borderRadius: 5, borderWidth: 1, borderColor: '#40465F', backgroundColor: '#252836'}}>
                <CardMedia
                    sx={{ height: 140 }}
                    image={product.image_url ? product.image_url: '/assets/images/placeholder.svg'}
                    title={product.title}
                />
                <CardContent>
                    <div className={'flex flex-row items-center justify-start text-white'}>
                        <span className={'text-xl mr-3 font-semibold truncate'}>
                           {product.title}
                        </span>
                        <OpenInNewOutlinedIcon className={'w-6 h-6'} onClick={(e) => handleLink(e,product.id)}/>
                    </div>
                    <div className={'h-32'}>
                         <span className={'text-sm text-[#9AA0B9] font-normal'}>
                            {product.description?.substring(0, 100)}{product.description?.length > 100 && "..."}
                         </span>
                    </div>
                    <div className={'flex flex-row mt-5 border-[1px] rounded-md border-[#353849] py-[2px] bg-[#40465F] justify-center items-center w-fit px-4'}>
                        <div className={'rounded-full w-2 h-2 mr-2'} style={{background: Categories.filter(cat => cat.name == product.category_name)[0]?.color || "#FFF"}}/>
                        <span className={'text-sm text-white'}>{product.category_name}</span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}

export default ProductCard;