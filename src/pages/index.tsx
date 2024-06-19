import React, {useEffect, useState} from 'react';
import {useRouter} from "next/router";
import Image from 'next/image'
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import cookie from 'js-cookie';

import Collapse from '@mui/material/Collapse';
import Drawer from '@mui/material/Drawer';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputBase from '@mui/material/InputBase';
import MenuItem from '@mui/material/MenuItem';
import SearchIcon from "@mui/icons-material/Search";
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import Pagination from '@mui/material/Pagination';

import { Meta } from '@/layouts/Meta';
import { Main } from '@/templates/Main';
import ProductCard from '@/components/card';
import https from "https";

const BootstrapInput = styled(InputBase)(({ theme }) => ({
    'label + &': {
        marginTop: theme.spacing(3),
    },
    '& .MuiInputBase-input': {
        borderRadius: 30,
        position: 'relative',
        backgroundColor: '#1F1D2B',
        border: '1px solid #7C829B',
        fontSize: 14,
        color: '#7C829B',
        padding: '5px 30px 5px 12px',
        transition: theme.transitions.create(['border-color', 'box-shadow']),
        // Use the system font instead of the default Roboto font.
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(','),
        '&:focus': {
            borderRadius: 30,
            borderColor: '#7C829B',
            boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
        },
    },
}));

function Index({products, utmParams, categories}: any) {
    const [navToggle, setNavToggle] = useState(false);
    const [filter, setFilter] = useState('New');
    const [more, setMore] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const router = useRouter()
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (router.query.category && typeof router.query.category === 'string') {
            const queryCategories = router.query.category?.split(",");

            const categoriesToAdd = categories.filter((category: any) => {
                return !!queryCategories.find((queryCatId: string) => Number(queryCatId) == category.id)
            });
            if(categoriesToAdd?.length > 0) {
                let tempSelectedCategories = [...selectedCategories, ...categoriesToAdd];
                // @ts-ignore
                tempSelectedCategories = [...new Set(tempSelectedCategories)];
                setSelectedCategories(() => tempSelectedCategories);
            }
        }

        if (router.query.page) {
            setPage(Number(router.query.page));
        }

        if (router.query.search) {
            setSearchTerm(router.query.search as string);
        }

        let uid = cookie.get('uid');
        if (!uid){
            uid = uuidv4();
            cookie.set('uid', uid);
        }
        // Retrieve stored utmParams from the cookie
        let storedUtmParams = cookie.get('utmPramas') ? JSON.parse(cookie.get('utmPramas') as string) : {};
        // If there's any change in utm parameters, update the cookie
        const isUtmChanged = Object.keys(utmParams).some(key => utmParams[key] !== storedUtmParams[key]);
        if (isUtmChanged) {
            // Save the new utmParams in the cookie
            cookie.set('utmPramas', JSON.stringify(utmParams));
            storedUtmParams = utmParams;
            const fetchData = async () => {
                // Send uid and utmParams to your API
                // Note: Replace with the appropriate keys and details relevant to your API specs
                const utmEndpoint = `${process.env.NEXT_PUBLIC_API_SERVER}/api/v1/product/create-utm-param/`;
                try{
                    await axios.post(utmEndpoint, {
                        uid: uid,
                        ctime: new Date(),
                        ...storedUtmParams
                    }, {httpsAgent: new https.Agent({ rejectUnauthorized: false })} );
                } catch (error) {
                    if (error) {
                        // The request was made and the server responded with a status code that falls out of the range of 2xx
                        console.log(error);
                    }
                }
            };
            fetchData();
        }
    },[])
    const handleChange = (event: SelectChangeEvent) => {
        const filterValue = event.target.value as string;
        setFilter(filterValue);

        router.replace({
            pathname: router.pathname,
            query: { ...router.query, ordering: filterValue }
        });
    };

    const handlePaginationChange =(event: any, value: number) => {
        event.stopPropagation();
        setPage(value);
        router.replace({
            pathname: router.pathname,
            query: { ...router.query, page: value }
        });
    }

    const toggleDrawer =
        (open: boolean) => {
        setNavToggle(open);
    };

    const handleSearch = () => {
        router.replace({
            pathname: router.pathname,
            query: { ...router.query, search: searchTerm }
        });
    }

    const handleAddCategory = (event: React.MouseEvent<HTMLDivElement>, item : any) => {
        event.stopPropagation();
        if(!selectedCategories.find((category: any) => category.name === item.name)) {
            setSelectedCategories([...selectedCategories, item]);
        }

        const categoryIds = router.query.category && typeof router.query.category === 'string' ? router.query.category?.split(',') : [];
        if (!categoryIds.includes(String(item.id))) {
            categoryIds.push(item.id);
        }

        setPage(1);

        router.replace({
            pathname: router.pathname,
            query: { ...router.query, category: categoryIds.join(','), page: 1 }
        });
    };

    const handleRemoveCategory = (event: React.MouseEvent<SVGSVGElement>, item: any) => {
        event.stopPropagation();
        const index = selectedCategories.findIndex((category: any) => category.id === item.id);
        const data = [...selectedCategories];
        if(index !== -1) {
            data.splice(index, 1);
        }
        setSelectedCategories(data);

        const remainingCategories = (router.query.category as string)?.split(',')?.filter(categoryId => categoryId !== encodeURIComponent(item.id));
        const category_router = remainingCategories?.length ? remainingCategories.join(',') : null;

        router.replace({
            pathname: router.pathname,
            query: { ...router.query, category: category_router }
        });
    };

    return (
        <Main meta={<Meta title="AI Product" description="AI Product" />}>
            <div className={'flex flex-col mx-auto justify-center max-w-screen-xl bg-[#1F1D2B]'}>
                <div className={'flex justify-end mt-5 md:hidden xs:block self-end'}>
                    <Image src={'/assets/images/menu.svg'} width={30} height={30} alt={'menu'} className={'cursor-pointer'} onClick={() => toggleDrawer(true)}/>
                    <Drawer
                        anchor={'left'}
                        open={navToggle}
                        onClose={() => toggleDrawer(false)}
                    >
                        <div className={`flex flex-col py-5 px-3 w-60 text-[#9AA0B9] bg-[#1F1D2B]` }>
                            {Array.isArray(categories) && categories.map((category: any) => (
                                <div key={category.id} className={'flex flex-row items-center cursor-pointer mb-5'} onClick={(event) => handleAddCategory(event, category)}>
                                    <div className={'flex w-8 h-8 mr-5 rounded-[5px] items-center justify-center'} style={{background: `${category.color}`}}>
                                        <Image src={category.icon} alt={category.name} width={20} height={20} />
                                    </div>
                                    <span className={'hover:text-[#D6DCF5]'}>{category.name}</span>
                                </div>
                            ))}
                        </div>
                    </Drawer>
                </div>
                <div className="flex flex-col items-center justify-center w-full md:pt-10 md:pb-16 xs:mt-5 xs:mb-5">
                    <span className={'lg:text-5xl md:text-4xl xs:text-3xl text-white mb-2 text-center font-lato font-bold text-[56px]'}>Discover the trendiest AI websites</span>
                    <div className={'mb-7 text-base text-center'}>
                        <span className={'text-[#6944FF] font-bold'}>6000+</span>
                        <span className={'text-[#7C829B] ml-1 font-normal'}>Best AI Companies and Tools, Auto Updated hourly</span>
                    </div>
                    <div className={'flex flex-row rounded-md px-3 py-2 bg-[#1F1D2B] border-[#40465F] border-[1px] sm:w-1/2 md:w-1/3 lg:w-1/4 xs:w-full md:mx-0 xs:mx-5'}>
                        <input className={'w-full text-white bg-[#1F1D2B] text-sm border-none outline-none placeholder-[#7C829B]'}
                               placeholder={'Search AI Tools by Keyword'}
                               value={searchTerm}
                               onChange={(e) => {
                                   setSearchTerm(e.target.value);
                               }}
                               onKeyDown={(e) => {
                                   if (e.key === 'Enter') {
                                       handleSearch();
                               }}}
                        />
                        <SearchIcon className={'text-[#7C829B]'} onClick={() => handleSearch()}/>
                    </div>
                </div>
                <div className={'flex flex-row justify-center'}>
                    <div className={`flex flex-col md:block xs:hidden xs:w-full md:w-1/5 mt-16 text-sm text-[#9AA0B9] justify-start h-full`}>
                        <div className={'flex flex-row mb-3 items-center cursor-pointer'}>
                            <div className={'flex w-8 h-8 mr-5 rounded-[5px] items-center justify-center'}>
                            </div>
                            <span className={'hover:text-[#D6DCF5] text-white'}>All</span>
                        </div>
                        {Array.isArray(categories) && categories.slice(0,15).map((category: any) => (
                            <div key={category.id} className={'flex flex-row items-center cursor-pointer mb-3'} onClick={(event) => handleAddCategory(event, category)}>
                                <div className={`flex w-8 h-8 mr-5 rounded-[5px] items-center justify-center`} style={{background: `${category.color}`}}>
                                    <Image src={category.icon} alt={category.name} width={20} height={20} />
                                </div>
                                <span className={'hover:text-[#D6DCF5]'}>{category.name}</span>
                            </div>
                        ))}
                        <Collapse in={more}>
                            {Array.isArray(categories) && categories.slice(16,categories.length -1).map((category: any) => (
                                <div key={category.id} className={'flex flex-row items-center cursor-pointer mb-3'} onClick={(event) => handleAddCategory(event, category)}>
                                    <div className={`flex w-8 h-8 mr-5 rounded-[5px] items-center justify-center`} style={{background: `${category.color}`}}>
                                        <Image src={category.icon} alt={category.name} width={20} height={20} />
                                    </div>
                                    <span className={'hover:text-[#D6DCF5]'}>{category.name}</span>
                                </div>
                            ))}
                        </Collapse>
                        <div className={'flex flex-row items-center cursor-pointer'} onClick={() => setMore((prev) => !prev)}>
                            <div className={'flex w-8 h-8 mr-5 border-[1px] border-white rounded-[5px] items-center justify-center'}>
                                <Image src={ more ? '/assets/images/minus.svg' : '/assets/images/more.svg'} alt={'more'} width={20} height={20} />
                            </div>
                            <span className={'hover:text-[#D6DCF5]'}>{ more ? 'Less' : 'More' }</span>
                        </div>
                    </div>
                    <div className={'flex flex-col xs:w-full md:w-4/5 justify-start'}>
                        <div className={'flex xs:flex-col-reverse md:flex-row justify-between w-full mb-5'}>
                            <div className={'flex flex-row items-center justify-start  w-full flex-wrap'}>
                                {selectedCategories.map((category: any) => {
                                    return (
                                        <div className={'w-fit border-none text-sm text-[#9AA0B9] mr-5 items-center justify-start flex'} key={category.id}>
                                            {category.name}
                                            <CloseIcon className="cursor-pointer ml-2 w-5 h-5" onClick={(event) => handleRemoveCategory(event, category)}/>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className={'w-36 xs:mb-5 md:mb-0'}>
                                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                                    <Select
                                        labelId="filter"
                                        id="filter"
                                        value={filter}
                                        label=""
                                        onChange={handleChange}
                                        input={<BootstrapInput />}
                                        renderValue={(value) => `Sort by: ${value}`}
                                    >
                                        <MenuItem value={'New'}>New</MenuItem>
                                        <MenuItem value={'Oldest'}>Oldest</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                        </div>
                        <div className={'w-full flex flex-col items-center'}>
                            { products?.results?.length >= 1 &&
                                <div className={'flex justify-end w-full mr-5'}>
                                    <Pagination sx={{
                                        '& .MuiPaginationItem-root' : {
                                            color: '#9AA0B9',
                                            borderColor: '#9AA0B9'
                                        }
                                    }} color="primary" showFirstButton showLastButton count={Math.round(products.count / 18)} page={page} onChange={(event: React.ChangeEvent<unknown>, value: number) => handlePaginationChange(event, value)} />
                                </div>
                            }
                            <Grid container spacing={3}>
                                {products?.results?.map((product: any) => (
                                    <Grid item xs={12} sm={6} lg={4} key={product.id}>
                                        <ProductCard {...product}/>
                                    </Grid>
                                ))}
                            </Grid>
                            { products?.results?.length >= 1 &&
                                <div className={'flex justify-end w-full mr-5'}>
                                    <Pagination sx={{
                                        '& .MuiPaginationItem-root' : {
                                            color: '#9AA0B9',
                                            borderColor: '#9AA0B9'
                                        }
                                    }} color="primary" showFirstButton showLastButton count={Math.round(products.count / 18)} page={page} onChange={(event: React.ChangeEvent<unknown>, value: number) => handlePaginationChange(event, value)} />
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </Main>
    );
}

// @ts-ignore
export async function getServerSideProps({req, query }) {

    let client_ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if(!client_ip_address)
    {
        client_ip_address = null;
    }
    let utmParams = {
        utm_campaign: query.utm_campaign || null,
        utm_content: query.utm_content || null,
        utm_medium: query.utm_medium || null,
        utm_source: query.utm_source || null,
        client_ip_address: client_ip_address,
        client_user_agent: req.headers['user-agent'] || null,
        source_url: req.headers.referer || null,
        utm_term: query.utm_term || null,
        fbclid: query.fbclid || null,
        gclid: query.gclid || null,
        gbraid: query.gbraid || null,
        wbraid: query.wbraid || null,
        irclickid: query.irclickid || null,
        blogsource: query.blogsource || null,
        ttclid: query.ttclid || null,
        sccid: query.sccid || null
    }

    const category = decodeURIComponent(query.category || '') != 'undefined' ? decodeURIComponent(query.category || '') : '';
    // const ordering = decodeURIComponent(query.ordering || '') != 'undefined' ? decodeURIComponent(query.ordering || '') : '';
    let ordering: string = '';
    if (decodeURIComponent(query.ordering || '') != 'undefined') {
        switch(decodeURIComponent(query.ordering || '')) {
            case 'New':
                ordering = 'created_at';
                break;
            case 'Oldest':
                ordering = '-created_at';
                break;
            default:
                ordering = 'created_at';
                break;
        }
    }

    const agent = new https.Agent({
        rejectUnauthorized: false
    });

    const search = decodeURIComponent(query.search || '') != 'undefined' ? decodeURIComponent(query.search || '') : '';
    const decodedPage = decodeURIComponent(query.page || '');
    const page = Number(decodedPage) == 0 ? 1 : Number(decodedPage);
    const limit = 18;
    const offset = 18 * (page-1);
    const endpoint = `${process.env.NEXT_PUBLIC_API_SERVER}/api/v1/product/?category=${category}&ordering=${ordering}&search=${search}&limit=${limit}&offset=${offset}`;
    const cat_endpoint = `${process.env.NEXT_PUBLIC_API_SERVER}/api/v1/product/category`;
    const [productsResponse, categoriesResponse] = await Promise.all([
        axios.get(endpoint, { httpsAgent: agent }),
        axios.get(cat_endpoint, { httpsAgent: agent })
    ]);
    const products = productsResponse.data;
    const categories = categoriesResponse.data;
    return { props: { products, utmParams, categories } };
}

export default Index;