import React from 'react'
import { ProductPreview } from './ProductPreview.jsx'

export function ProductList({ products }) {

    return (
        <div className="products-list-grid">
            {products.map(product => <ProductPreview product={product} key={product.id} />)}
        </div>
    )
} 