"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { siteConfig } from "../../config/site";

const adminContent = siteConfig.admin;
const statuses = ["new", "preparing", "ready", "delivered", "cancelled"];
const tabs = [
	{ id: "all", label: "All orders" },
	{ id: "new", label: "New orders" },
	{ id: "reviews", label: "Reviews" },
	{ id: "menu", label: "Menu" },
	{ id: "settings", label: "Settings" },
];
const blankProduct = {
	id: "",
	name: "",
	price: "",
	category: "Coffee",
	description: "",
	badge: "New",
	image: "",
};

function Field({ label, value, onChange, multiline = false, type = "text" }) {
	const props = {
		value: value || "",
		onChange: (event) => onChange(event.target.value),
		type,
		placeholder: label,
	};
	return (
		<label className="editor-field">
			<span>{label}</span>
			{multiline ? <textarea {...props} rows={3} /> : <input {...props} />}
		</label>
	);
}

function OrderList({ orders, onUpdate }) {
	if (orders.length === 0) {
		return <div className="empty-state">No orders in this view.</div>;
	}
	return (
		<div className="order-list">
			{orders.map((order) => (
				<article className="order-card" key={order.id}>
					<div className="order-top">
						<div>
							<strong>{order.id}</strong>
							<span>
								{order.customer.name} ·{" "}
								{new Date(order.createdAt).toLocaleTimeString([], {
									hour: "numeric",
									minute: "2-digit",
								})}
							</span>
						</div>
						<span className={`status status-${order.status}`}>
							{order.status}
						</span>
					</div>
					<div className="order-items">
						{order.items.map((item) => (
							<span key={item.id}>
								{item.quantity} × {item.name}
							</span>
						))}
					</div>
					<div className="order-actions">
						<label>
							Wait{" "}
							<input
								type="number"
								min="0"
								max="120"
								value={order.waitMinutes}
								onChange={(event) =>
									onUpdate(order.id, order.status, event.target.value)
								}
							/>{" "}
							min
						</label>
						<select
							value={order.status}
							onChange={(event) =>
								onUpdate(order.id, event.target.value, order.waitMinutes)
							}
						>
							{statuses.map((status) => (
								<option key={status}>{status}</option>
							))}
						</select>
						<button
							className="small-button"
							onClick={() => onUpdate(order.id, "ready", order.waitMinutes)}
						>
							Mark ready
						</button>
					</div>
				</article>
			))}
		</div>
	);
}

export default function AdminPage() {
	const [credentials, setCredentials] = useState({
		username: "",
		password: "",
	});
	const [session, setSession] = useState(null);
	const [activeTab, setActiveTab] = useState("all");
	const [orders, setOrders] = useState([]);
	const [products, setProducts] = useState([]);
	const [reviews, setReviews] = useState([]);
	const [configDraft, setConfigDraft] = useState(siteConfig);
	const [productDraft, setProductDraft] = useState(blankProduct);
	const [editingProduct, setEditingProduct] = useState(null);
	const [pendingRemoval, setPendingRemoval] = useState(null);
	const [error, setError] = useState("");
	const [saved, setSaved] = useState("");

	async function login(event) {
		event.preventDefault();
		const response = await fetch("/api/admin/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(credentials),
		});
		if (!response.ok) {
			setError("That staff login did not match.");
			return;
		}
		setSession(true);
		setCredentials({ username: "", password: "" });
		loadDashboard();
	}

	async function loadDashboard() {
		const [orderResponse, productResponse, reviewResponse, configResponse] =
			await Promise.all([
				fetch("/api/orders"),
				fetch("/api/products"),
				fetch("/api/reviews"),
				fetch("/api/config"),
			]);
		if (!orderResponse.ok || !configResponse.ok) {
			setError("Session expired. Please sign in again.");
			setSession(null);
			return;
		}
		setOrders((await orderResponse.json()).orders);
		setProducts((await productResponse.json()).products);
		setReviews((await reviewResponse.json()).reviews);
		setConfigDraft((await configResponse.json()).config);
	}

	function updateConfig(path, value) {
		setSaved("");
		setConfigDraft((current) => {
			const next = structuredClone(current);
			let target = next;
			path.slice(0, -1).forEach((key) => {
				target = target[key];
			});
			target[path[path.length - 1]] = value;
			return next;
		});
	}

	async function saveConfig(event) {
		event.preventDefault();
		const response = await fetch("/api/config", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ config: configDraft }),
		});
		if (response.ok) {
			setConfigDraft((await response.json()).config);
			setSaved("Global settings saved");
		} else {
			setError("The global settings could not be saved.");
		}
	}

	async function saveProducts(nextProducts = products) {
		const response = await fetch("/api/products", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ products: nextProducts }),
		});
		if (response.ok) {
			setProducts((await response.json()).products);
			setSaved("Menu saved");
		} else {
			setError(
				"The menu could not be saved. Check every product has an id, name, and price.",
			);
		}
	}

	async function updateOrder(id, status, waitMinutes) {
		const response = await fetch("/api/orders", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ id, status, waitMinutes }),
		});
		if (response.ok) setOrders((await response.json()).orders);
	}

	async function logout() {
		await fetch("/api/admin/logout", { method: "POST" });
		setSession(null);
	}

	function openProductEditor(product) {
		setEditingProduct({ ...product, _originalId: product.id });
	}

	function saveEditedProduct(event) {
		event.preventDefault();
		const { _originalId, ...product } = editingProduct;
		setProducts((current) =>
			current.map((item) => (item.id === _originalId ? product : item)),
		);
		setEditingProduct(null);
		setSaved("Product draft updated. Save all products to publish it.");
	}

	function confirmRemoveProduct() {
		setProducts((current) =>
			current.filter((product) => product.id !== pendingRemoval.id),
		);
		setPendingRemoval(null);
		setSaved(
			"Product removed from the draft. Save all products to publish it.",
		);
	}

	function addProduct(event) {
		event.preventDefault();
		setProducts((current) => [
			...current,
			{
				...productDraft,
				price: Number(productDraft.price),
				image:
					productDraft.image ||
					"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85",
			},
		]);
		setProductDraft(blankProduct);
		setSaved("");
	}

	if (!session) {
		return (
			<main className="admin-page">
				<Link className="brand" href="/">
					{siteConfig.appName}
					<small>{adminContent.descriptor}</small>
				</Link>
				<div className="login-card">
					<div className="eyebrow">{adminContent.loginEyebrow}</div>
					<h1>{adminContent.loginTitle}</h1>
					<p>{adminContent.loginDescription}</p>
					<form onSubmit={login}>
						{["username", "password"].map((field) => (
							<div className="field" key={field}>
								<label htmlFor={field}>{field}</label>
								<input
									id={field}
									required
									type={field === "password" ? "password" : "text"}
									value={credentials[field]}
									onChange={(event) =>
										setCredentials({
											...credentials,
											[field]: event.target.value,
										})
									}
								/>
							</div>
						))}
						{error && <div className="notice">{error}</div>}
						<button className="solid-button full-button">Sign in</button>
					</form>
					<Link className="back-link" href="/">
						{adminContent.backLink}
					</Link>
				</div>
			</main>
		);
	}

	const menuConfig = configDraft.customer.menu;
	const visibleOrders =
		activeTab === "new"
			? orders.filter((order) => order.status === "new")
			: orders;
	const activeCount = orders.filter(
		(order) => !["delivered", "cancelled"].includes(order.status),
	).length;

	return (
		<main className="admin-page">
			<header className="admin-header">
				<div>
					<Link className="brand" href="/">
						{siteConfig.appName}
						<small>{adminContent.descriptor}</small>
					</Link>
					<h1>{adminContent.title}</h1>
				</div>
				<div className="admin-header-actions">
					{saved && <span className="save-state">{saved}</span>}
					<button className="text-button" onClick={logout}>
						Sign out
					</button>
				</div>
			</header>

			<nav className="admin-tabs" aria-label="Admin sections">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						className={activeTab === tab.id ? "admin-tab active" : "admin-tab"}
						onClick={() => setActiveTab(tab.id)}
					>
						{tab.label}
						{tab.id === "new" && (
							<span>
								{orders.filter((order) => order.status === "new").length}
							</span>
						)}
						{tab.id === "all" && <span>{activeCount}</span>}
					</button>
				))}
			</nav>

			{error && <div className="notice admin-notice">{error}</div>}

			{(activeTab === "all" || activeTab === "new") && (
				<section className="admin-view">
					<div className="dashboard-title">
						<div>
							<div className="eyebrow">{adminContent.queueEyebrow}</div>
							<h2>{activeTab === "new" ? "New orders" : "All orders"}</h2>
						</div>
						<span className="count-pill">{visibleOrders.length} orders</span>
					</div>
					<OrderList orders={visibleOrders} onUpdate={updateOrder} />
				</section>
			)}

			{activeTab === "reviews" && (
				<section className="admin-view">
					<div className="dashboard-title">
						<div>
							<div className="eyebrow">{adminContent.reviewsEyebrow}</div>
							<h2>Guest reviews</h2>
						</div>
						<span className="count-pill">{reviews.length} notes</span>
					</div>
					<div className="review-admin-grid">
						{reviews.map((review) => (
							<article className="review-admin-card" key={review.id}>
								<div className="stars">{"★".repeat(review.rating)}</div>
								<p>“{review.text}”</p>
								<small>
									{review.name} · {review.date}
								</small>
							</article>
						))}
					</div>
				</section>
			)}

			{activeTab === "settings" && (
				<section className="admin-view editor-section admin-editor-section">
					<div className="editor-heading">
						<div>
							<div className="eyebrow">Global content</div>
							<h2>Control the room.</h2>
							<p>
								Update your storefront identity, copy, navigation, pricing, and
								customer-facing labels from one place.
							</p>
						</div>
						<button className="solid-button" onClick={saveConfig}>
							Save global settings
						</button>
					</div>
					<form className="config-editor" onSubmit={saveConfig}>
						<div className="editor-panel">
							<h3>Identity &amp; operations</h3>
							<div className="editor-fields">
								<Field
									label="App name"
									value={configDraft.appName}
									onChange={(value) => updateConfig(["appName"], value)}
								/>
								<Field
									label="Tagline"
									value={configDraft.tagline}
									onChange={(value) => updateConfig(["tagline"], value)}
								/>
								<Field
									label="Brand descriptor"
									value={configDraft.brand.descriptor}
									onChange={(value) =>
										updateConfig(["brand", "descriptor"], value)
									}
								/>
								<Field
									label="Address"
									value={configDraft.brand.address}
									onChange={(value) =>
										updateConfig(["brand", "address"], value)
									}
								/>
								<Field
									label="Currency code"
									value={configDraft.currency}
									onChange={(value) => updateConfig(["currency"], value)}
								/>
								<Field
									label="Currency symbol"
									value={configDraft.currencySymbol}
									onChange={(value) => updateConfig(["currencySymbol"], value)}
								/>
								<Field
									label="Service fee"
									type="number"
									value={configDraft.serviceFee}
									onChange={(value) =>
										updateConfig(["serviceFee"], Number(value))
									}
								/>
								<Field
									label="Tax rate"
									type="number"
									value={configDraft.taxRate}
									onChange={(value) => updateConfig(["taxRate"], Number(value))}
								/>
							</div>
						</div>
						<div className="editor-panel">
							<h3>Customer copy</h3>
							<div className="editor-fields">
								<Field
									label="Announcement"
									value={configDraft.customer.announcement}
									onChange={(value) =>
										updateConfig(["customer", "announcement"], value)
									}
								/>
								<Field
									label="Hero title"
									value={configDraft.customer.hero.title}
									onChange={(value) =>
										updateConfig(["customer", "hero", "title"], value)
									}
								/>
								<Field
									label="Hero description"
									multiline
									value={configDraft.customer.hero.description}
									onChange={(value) =>
										updateConfig(["customer", "hero", "description"], value)
									}
								/>
								<Field
									label="Menu title"
									value={menuConfig.title}
									onChange={(value) =>
										updateConfig(["customer", "menu", "title"], value)
									}
								/>
								<Field
									label="Menu description"
									multiline
									value={menuConfig.description}
									onChange={(value) =>
										updateConfig(["customer", "menu", "description"], value)
									}
								/>
								<Field
									label="Story title"
									value={configDraft.customer.story.title}
									onChange={(value) =>
										updateConfig(["customer", "story", "title"], value)
									}
								/>
								<Field
									label="Story description"
									multiline
									value={configDraft.customer.story.description}
									onChange={(value) =>
										updateConfig(["customer", "story", "description"], value)
									}
								/>
							</div>
						</div>
					</form>
				</section>
			)}

			{activeTab === "menu" && (
				<section className="admin-view editor-section admin-editor-section">
					<div className="editor-heading">
						<div>
							<div className="eyebrow">Catalog editor</div>
							<h2>Shape the menu.</h2>
							<p>
								Edit an item in a focused window, preview its image, and save
								the complete catalog when ready.
							</p>
						</div>
						<button className="solid-button" onClick={() => saveProducts()}>
							Save all products
						</button>
					</div>
					<div className="product-editor-grid">
						{products.map((product) => (
							<article className="product-editor" key={product.id}>
								<div
									className="product-preview"
									style={{ backgroundImage: `url(${product.image})` }}
								>
									<span>{product.category}</span>
								</div>
								<div className="product-editor-body">
									<div className="product-editor-top">
										<strong>{product.name || "Untitled product"}</strong>
										<span className="price">
											{configDraft.currencySymbol}
											{Number(product.price).toFixed(2)}
										</span>
									</div>
									<p>{product.description}</p>
									<div className="product-card-actions">
										<button
											className="small-button"
											type="button"
											onClick={() => openProductEditor(product)}
										>
											Edit product
										</button>
										<button
											className="remove-button"
											type="button"
											onClick={() => setPendingRemoval(product)}
										>
											Remove
										</button>
									</div>
								</div>
							</article>
						))}
					</div>
					<form className="new-product-panel" onSubmit={addProduct}>
						<div>
							<div className="eyebrow">New item</div>
							<h3>Add a product to the catalog</h3>
						</div>
						<div className="editor-fields new-product-fields">
							<Field
								label="ID"
								value={productDraft.id}
								onChange={(value) =>
									setProductDraft({ ...productDraft, id: value })
								}
							/>
							<Field
								label="Name"
								value={productDraft.name}
								onChange={(value) =>
									setProductDraft({ ...productDraft, name: value })
								}
							/>
							<Field
								label="Price"
								type="number"
								value={productDraft.price}
								onChange={(value) =>
									setProductDraft({ ...productDraft, price: value })
								}
							/>
							<Field
								label="Image URL"
								value={productDraft.image}
								onChange={(value) =>
									setProductDraft({ ...productDraft, image: value })
								}
							/>
						</div>
						<button className="small-button">Add to editor</button>
					</form>
				</section>
			)}

			<AnimatePresence>
				{editingProduct && (
					<div
						className="admin-modal-backdrop"
						onClick={(event) =>
							event.target === event.currentTarget && setEditingProduct(null)
						}
					>
						<motion.div
							className="admin-modal"
							initial={{ opacity: 0, y: 24, scale: 0.97 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 16, scale: 0.98 }}
							transition={{ duration: 0.2 }}
						>
							<div className="panel-head">
								<div>
									<div className="eyebrow">Edit catalog item</div>
									<h2>{editingProduct.name || "Untitled product"}</h2>
								</div>
								<button
									className="close-button"
									type="button"
									onClick={() => setEditingProduct(null)}
									aria-label="Close editor"
								>
									×
								</button>
							</div>
							<form className="modal-form" onSubmit={saveEditedProduct}>
								<div
									className="modal-image-preview"
									style={{ backgroundImage: `url(${editingProduct.image})` }}
								/>
								<div className="editor-fields">
									<Field
										label="ID"
										value={editingProduct.id}
										onChange={(value) =>
											setEditingProduct({ ...editingProduct, id: value })
										}
									/>
									<Field
										label="Name"
										value={editingProduct.name}
										onChange={(value) =>
											setEditingProduct({ ...editingProduct, name: value })
										}
									/>
									<Field
										label="Price"
										type="number"
										value={editingProduct.price}
										onChange={(value) =>
											setEditingProduct({
												...editingProduct,
												price: Number(value),
											})
										}
									/>
									<label className="editor-field">
										<span>Category</span>
										<select
											value={editingProduct.category}
											onChange={(event) =>
												setEditingProduct({
													...editingProduct,
													category: event.target.value,
												})
											}
										>
											{(menuConfig.categories || [])
												.filter((category) => category !== "All")
												.map((category) => (
													<option key={category}>{category}</option>
												))}
										</select>
									</label>
									<Field
										label="Badge"
										value={editingProduct.badge}
										onChange={(value) =>
											setEditingProduct({ ...editingProduct, badge: value })
										}
									/>
									<Field
										label="Image URL"
										value={editingProduct.image}
										onChange={(value) =>
											setEditingProduct({ ...editingProduct, image: value })
										}
									/>
									<Field
										label="Description"
										multiline
										value={editingProduct.description}
										onChange={(value) =>
											setEditingProduct({
												...editingProduct,
												description: value,
											})
										}
									/>
								</div>
								<div className="modal-actions">
									<button
										className="text-button"
										type="button"
										onClick={() => setEditingProduct(null)}
									>
										Cancel
									</button>
									<button className="solid-button" type="submit">
										Save product draft
									</button>
								</div>
							</form>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
			<AnimatePresence>
				{pendingRemoval && (
					<div
						className="admin-modal-backdrop"
						onClick={(event) =>
							event.target === event.currentTarget && setPendingRemoval(null)
						}
					>
						<motion.div
							className="confirm-modal"
							initial={{ opacity: 0, y: 18, scale: 0.97 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 12, scale: 0.98 }}
						>
							<div className="eyebrow">Confirm catalog change</div>
							<h2>Remove {pendingRemoval.name}?</h2>
							<p>
								This only removes the item from the current draft. It will not
								be published until you save all products.
							</p>
							<div className="modal-actions">
								<button
									className="text-button"
									type="button"
									onClick={() => setPendingRemoval(null)}
								>
									Keep product
								</button>
								<button
									className="remove-confirm-button"
									type="button"
									onClick={confirmRemoveProduct}
								>
									Remove from draft
								</button>
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</main>
	);
}
