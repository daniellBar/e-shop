import { dbService } from './dbService';

export const productService = {
    getProducts,
    getById
}

async function getProducts() {
    try {
        const productsRef = dbService.getRef('products')
        const snapshot = await productsRef.get()
        const products = snapshot.exists() ? snapshot.val() : null
        return products
    }
    catch (err) {
        console.log('Had Issues getting products from db');
        console.dir(err);
        throw err;
    }

}

async function getById(_id) {
    try {
        const productRef = dbService.getRef('products').orderByChild('id').equalTo(_id)
        const snapshot = await productRef.get()
        const dbProductData = snapshot.exists() ? snapshot.val() : null
        return _extractProduct(dbProductData)
    }
    catch (err) {
        console.log(`Had Issues getting product with id: ${_id} from db`);
        console.dir(err);
        throw err;
    }
}

function _extractProduct(dbProductData) {
    const data = Object.values(dbProductData)
    return data[0]
}