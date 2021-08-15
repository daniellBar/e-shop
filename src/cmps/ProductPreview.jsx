import React, { Component } from "react";
import { Link } from "react-router-dom";

export class ProductPreview extends Component {
    render() {
        const { product } = this.props
        return (
            <section className="product-preview-container" >
                <Link className="product-preview" to={`product/${product.id}`}>
                    <div className="product-preview-img">
                        <img className="img-fit" src={product.images[0].url} alt="product-main-img" />
                    </div>
                    <div className="product-preview-title">{product.title}</div>
                    <div className="product-preview-price">{product.max_price !== product.min_price ? `${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'USD' }).format(product.min_price)} - ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'USD' }).format(product.max_price)}` : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'USD' }).format(product.max_price)}</div>
                </Link>
            </section>)
    }
}

