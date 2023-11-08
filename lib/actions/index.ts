"use server";


import { revalidatePath } from "next/cache";
import Products from "../models/products.model";
import { connectToDB } from "../mongoose";
import { scrapedAmazonProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { User } from "@/types";
import { generateEmailBody, sendEmail } from "../nodemailer";




export async function scrapeAndStoreProduct(productUrl: string){
    if(!productUrl) return;

    try {

        connectToDB();

        const scrapedProduct = await scrapedAmazonProduct(productUrl);  

        if(!scrapedProduct) return;

        let product = scrapedProduct;

        const existingProduct = await Products.findOne({ url: scrapedProduct.url });

        if(existingProduct) {
            const updatedPriceHistory: any = [
                ...existingProduct.priceHistory,
                { price: scrapedProduct.currentPrice }
            ]

            product = {
                ...scrapedProduct,
                priceHistory: updatedPriceHistory,
                lowestPrice: getLowestPrice(updatedPriceHistory),
                highestPrice: getHighestPrice(updatedPriceHistory),
                averagePrice: getAveragePrice(updatedPriceHistory),
              }
        }

        const newProduct = await Products.findOneAndUpdate(
            {url : scrapedProduct.url },
            product,
            { upsert: true, new: true
             },

        );

    
    revalidatePath(`/products/${newProduct._id}`);
        

    } catch (error: any){
        throw new Error(`Failed to create/update product:  ${error.message}`)
    }
 }

 export async function getProductById(productId: string) {
    try {
     connectToDB();

     const product = await Products.findOne({ _id: productId  });

     if(!product) return null;
     
     return product;

    } catch (error){
        console.log(error);
    }
 }

 export async function getAllProducts() {
    try {
    connectToDB();

    const products = await Products.find();

    return products;
    } catch (error){
    console.log(error);
    }
 }

 export async function getSimilarProducts(productId: string) {
    try {
    connectToDB();

    const currentProduct = await Products.findById(productId);

    if(!currentProduct) return null;

    const similarProducts = await Products.find({
        _id: { $ne: productId },

    }).limit(3);

    return similarProducts;
    } catch (error){
    console.log(error);
    }
 }

 export async function addUserEmailToProduct(productId: string, userEmail: string) {
    try {
      const product = await Products.findById(productId);
  
      if(!product) return;
  
      const userExists = product.users.some((user: User) => user.email === userEmail);
  
      if(!userExists) {
        product.users.push({ email: userEmail });
  
        await product.save();
  
        const emailContent = await generateEmailBody(product, "WELCOME");
  
        await sendEmail(emailContent, [userEmail]);
      }
    } catch (error) {
      console.log(error);
    }
  }