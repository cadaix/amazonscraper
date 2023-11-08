"use client"

import { scrapeAndStoreProduct } from "@/lib/actions";
import { FormEvent, useState } from "react"

const isValidAmazonProductURL = (url: string) => {
    try {
        const parsedURL = new URL(url);
        const hostname = parsedURL.hostname;

        // Check if hostname contains amazon.com or amazon.com.tr
        if (hostname.includes('amazon.com') || 
            hostname.includes('amazon.') || 
            hostname.endsWith('amazon') ||
            hostname.includes('amazon.com.tr') 
            
            ) 
            
            {
            return true;
        }
    } catch (error) {
        return false;
    }
}

const Searchbar = () => {

    const [searchPrompt, setSearchPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const isValidLink = isValidAmazonProductURL(searchPrompt);

        if (!isValidLink) return alert('Lütfen geçerli bir Amazon linki giriniz.');

        try {
            setIsLoading(true);
            // Burada bir işlem yapabilirsiniz
            const product = await scrapeAndStoreProduct(searchPrompt);
        } catch (error) {
            console.log(error);
            // Hata durumunda işleme girecek kodlar burada olmalı
            //scrape to product page
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form 
            className='flex flex-wrap gap-4 mt-12'
            onSubmit={handleSubmit}
        >
            <input 
                type="text"
                value={searchPrompt}
                onChange={(e) => setSearchPrompt(e.target.value)}
                placeholder="Ürünün linkini yazın."
                className="searchbar-input"
            />

            <button 
            type="submit" 
            className="searchbar-btn"
            disabled={searchPrompt === ''}
            >
                {isLoading ? 'Arıyor....' : 'Ara'}
            </button>
        </form>
    )
}

export default Searchbar;
