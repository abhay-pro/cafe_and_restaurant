"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { products } from "../data/products";
import { reviews } from "../data/reviews";
import { siteConfig } from "../config/site";

const content = siteConfig.customer;
const categories = content.menu.categories;
const reveal = {
	hidden: { opacity: 0, y: 28 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
	},
};

export default function Home() {
	const [category, setCategory] = useState(categories[0]);
	const [cart, setCart] = useState([]);
	const [cartOpen, setCartOpen] = useState(false);
	const [checkoutOpen, setCheckoutOpen] = useState(false);
	const [submitted, setSubmitted] = useState(null);
	const [form, setForm] = useState({ name: "", email: "", phone: "" });
	const [notice, setNotice] = useState("");
	const visibleProducts =
		category === categories[0]
			? products
			: products.filter((product) => product.category === category);
	const subtotal = cart.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0,
	);
	const total = subtotal
		? subtotal + siteConfig.serviceFee + subtotal * siteConfig.taxRate
		: 0;

	function addToCart(product) {
		setCart((current) => {
			const existing = current.find((item) => item.id === product.id);
			return existing
				? current.map((item) =>
						item.id === product.id
							? { ...item, quantity: item.quantity + 1 }
							: item,
					)
				: [...current, { ...product, quantity: 1 }];
		});
		setCartOpen(true);
	}

	function changeQuantity(id, amount) {
		setCart((current) =>
			current.flatMap((item) =>
				item.id === id && item.quantity + amount < 1
					? []
					: item.id === id
						? [{ ...item, quantity: item.quantity + amount }]
						: [item],
			),
		);
	}

	async function placeOrder(event) {
		event.preventDefault();
		setNotice("");
		const response = await fetch("/api/orders", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				customer: form,
				items: cart,
				total: Number(total.toFixed(2)),
			}),
		});
		const result = await response.json();
		if (!response.ok) {
			setNotice(result.error || "We could not place that order.");
			return;
		}
		setSubmitted(result.order);
		setCart([]);
	}

	return (
		<main className="site-shell">
			<div className="topline">{content.announcement}</div>
			<nav className="nav">
				<a className="brand" href="#top">
					{siteConfig.appName}
					<small>{siteConfig.brand.descriptor}</small>
				</a>
				<div className="nav-links">
					{siteConfig.navigation.map((item) => (
						<a key={item.href} href={item.href}>
							{item.label}
						</a>
					))}
				</div>
				<button className="cart-button" onClick={() => setCartOpen(true)}>
					{content.cart.button} (
					{cart.reduce((sum, item) => sum + item.quantity, 0)})
				</button>
			</nav>

			<motion.section
				className="hero"
				id="top"
				initial="hidden"
				animate="visible"
				variants={reveal}
			>
				<div>
					<div className="eyebrow">{content.hero.eyebrow}</div>
					<h1>{content.hero.title}</h1>
					<p className="hero-copy">{content.hero.description}</p>
					<div className="hero-actions">
						<a className="solid-button" href="#menu">
							{content.hero.primaryAction}
						</a>
						<a className="text-button" href="#story">
							{content.hero.secondaryAction}
						</a>
					</div>
				</div>
				<motion.div
					className="hero-image"
					initial={{ opacity: 0, scale: 0.96 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
				>
					<div className="hero-note">
						{content.hero.note}
						<span>{content.hero.noteDetail}</span>
					</div>
				</motion.div>
			</motion.section>

			<motion.section
				className="section"
				id="menu"
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, amount: 0.15 }}
				variants={reveal}
			>
				<div className="section-head">
					<div>
						<div className="eyebrow">{content.menu.eyebrow}</div>
						<h2>{content.menu.title}</h2>
					</div>
					<p className="section-sub">{content.menu.description}</p>
				</div>
				<div className="categories">
					{categories.map((item) => (
						<button
							key={item}
							className={`category ${category === item ? "active" : ""}`}
							onClick={() => setCategory(item)}
						>
							{item}
						</button>
					))}
				</div>
				<motion.div
					className="product-grid"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.1 }}
					variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
				>
					{visibleProducts.map((product) => (
						<motion.article
							className="product-card"
							key={product.id}
							variants={reveal}
						>
							<div
								className="product-image"
								style={{ backgroundImage: `url(${product.image})` }}
							>
								<span className="badge">{product.badge}</span>
							</div>
							<div className="product-info">
								<h3>{product.name}</h3>
								<p>{product.description}</p>
								<div className="product-row">
									<span className="price">
										{siteConfig.currencySymbol}
										{product.price.toFixed(2)}
									</span>
									<button
										className="add-button"
										onClick={() => addToCart(product)}
									>
										Add to bag
									</button>
								</div>
							</div>
						</motion.article>
					))}
				</motion.div>
			</motion.section>

			<motion.section
				className="split-band"
				id="story"
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, amount: 0.25 }}
				variants={reveal}
			>
				<div className="section">
					<div>
						<div className="eyebrow">{content.story.eyebrow}</div>
						<h2>{content.story.title}</h2>
					</div>
					<div>
						<p className="quote">{content.story.quote}</p>
						<p>{content.story.description}</p>
					</div>
				</div>
			</motion.section>
			<motion.section
				className="section"
				id="reviews"
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, amount: 0.2 }}
				variants={reveal}
			>
				<div className="section-head">
					<div>
						<div className="eyebrow">{content.reviews.eyebrow}</div>
						<h2>{content.reviews.title}</h2>
					</div>
				</div>
				<div className="review-grid">
					{reviews.map((review) => (
						<article className="review" key={review.id}>
							<div className="stars">{"★".repeat(review.rating)}</div>
							<p>“{review.text}”</p>
							<small>
								{review.name} · {review.date}
							</small>
						</article>
					))}
				</div>
			</motion.section>
			<motion.footer
				className="footer"
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, amount: 0.4 }}
				variants={reveal}
			>
				<span className="brand">{siteConfig.appName}</span>
				<span>{siteConfig.brand.address}</span>
				<a className="admin-link" href="/admin">
					{content.footer.staffLink}
				</a>
			</motion.footer>

			{cartOpen && (
				<div
					className="modal-backdrop"
					onClick={(event) =>
						event.target === event.currentTarget && setCartOpen(false)
					}
				>
					<aside className="cart-panel">
						<div className="panel-head">
							<h2>{content.cart.title}</h2>
							<button
								className="close-button"
								onClick={() => setCartOpen(false)}
								aria-label="Close bag"
							>
								×
							</button>
						</div>
						{submitted ? (
							<div className="notice">
								<strong>Order {submitted.id} is in!</strong>
								<br />
								We have your pickup details and will have it ready in about{" "}
								{submitted.waitMinutes} minutes. A receipt is headed to{" "}
								{submitted.customer.email}.
							</div>
						) : cart.length === 0 ? (
							<div className="notice">{content.cart.empty}</div>
						) : (
							<>
								<div>
									{cart.map((item) => (
										<div className="cart-line" key={item.id}>
											<div>
												<h3>{item.name}</h3>
												<small>
													{siteConfig.currencySymbol}
													{item.price.toFixed(2)} each
												</small>
											</div>
											<div className="qty">
												<button
													onClick={() => changeQuantity(item.id, -1)}
													aria-label={`Remove one ${item.name}`}
												>
													−
												</button>
												<span>{item.quantity}</span>
												<button
													onClick={() => changeQuantity(item.id, 1)}
													aria-label={`Add one ${item.name}`}
												>
													+
												</button>
											</div>
										</div>
									))}
								</div>
								<div className="totals">
									<div className="total-row">
										<span>Subtotal</span>
										<span>
											{siteConfig.currencySymbol}
											{subtotal.toFixed(2)}
										</span>
									</div>
									<div className="total-row">
										<span>Service fee</span>
										<span>
											{siteConfig.currencySymbol}
											{siteConfig.serviceFee.toFixed(2)}
										</span>
									</div>
									<div className="total-row">
										<span>Tax</span>
										<span>
											{siteConfig.currencySymbol}
											{(subtotal * siteConfig.taxRate).toFixed(2)}
										</span>
									</div>
									<div className="total-row grand">
										<span>Total</span>
										<span>
											{siteConfig.currencySymbol}
											{total.toFixed(2)}
										</span>
									</div>
								</div>
								{!checkoutOpen ? (
									<button
										className="solid-button full-button"
										onClick={() => setCheckoutOpen(true)}
									>
										{content.cart.checkout}
									</button>
								) : (
									<form className="checkout" onSubmit={placeOrder}>
										<h3>Pickup details</h3>
										{notice && <div className="notice">{notice}</div>}
										{["name", "email", "phone"].map((field) => (
											<div className="field" key={field}>
												<label htmlFor={field}>
													{field === "name" ? "Full name" : field}
												</label>
												<input
													id={field}
													required
													type={field === "email" ? "email" : "text"}
													value={form[field]}
													onChange={(event) =>
														setForm({ ...form, [field]: event.target.value })
													}
													placeholder={
														field === "name"
															? "Alex Morgan"
															: field === "email"
																? "alex@example.com"
																: "(555) 000-0000"
													}
												/>
											</div>
										))}
										<button className="solid-button full-button" type="submit">
											Pay {siteConfig.currencySymbol}
											{total.toFixed(2)} &amp; place order
										</button>
										<small className="admin-link">
											{content.cart.paymentNote}
										</small>
									</form>
								)}
							</>
						)}
					</aside>
				</div>
			)}
		</main>
	);
}
