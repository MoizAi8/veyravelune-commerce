import Link from "next/link";
import { redirect } from "next/navigation";
import { AdvanceOrder, ProductEditor } from "@/components/admin/editor";
import { Logout } from "@/components/admin/session";
import { orderTransitions } from "@/features/orders/contracts";
import { money } from "@/lib/money";
import { adminUser } from "@/server/auth/admin";
import { db } from "@/server/database";
import { listAdminOrders, listAdminProducts } from "@/server/services/administration";
export const dynamic = "force-dynamic";
export const metadata = { title: "Atelier administration", robots: { index: false } };

export default async function Admin({ searchParams }: { searchParams: Promise<{ products?: string; orders?: string }> }) {
  if (!await adminUser()) redirect("/admin/sign-in");
  const params = await searchParams;
  const toPage = (input?: string) => input && /^[1-9]\d{0,2}$/.test(input) ? Number(input) : 1;
  const products = toPage(params.products);
  const orders = toPage(params.orders);
  const database = db();
  const [inventory, recent, categories, productCount, orderCount] = await Promise.all([
    listAdminProducts(database, products), listAdminOrders(database, orders),
    database.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }), database.product.count(), database.order.count(),
  ]);
  const page = (productPage: number, orderPage: number, anchor: string) => "/admin?products=" + productPage + "&orders=" + orderPage + "#" + anchor;
  return <main className="shell admin-shell">
    <header className="admin-header"><Link className="text-link" href="/">Return to storefront</Link><Logout /></header>
    <h1>Atelier administration</h1>
    <nav className="admin-inline" aria-label="Administration"><a href="#inventory" className="text-link">Catalog and stock</a><a href="#orders" className="text-link">Orders</a></nav>
    <section id="inventory"><h2>Catalog and stock</h2><details className="admin-record"><summary>Create a piece</summary><ProductEditor categories={categories} /></details>
      {inventory.map((item) => <details key={item.id} className="admin-record"><summary>{item.title} · {item.active ? "Active" : "Disabled"}</summary><ProductEditor key={item.updatedAt.toISOString()} product={item} categories={categories} /></details>)}
      {(products > 1 || productCount > products * 20) && <nav className="pagination" aria-label="Catalog administration pages">
        {products > 1 && <Link className="text-link" href={page(products - 1, orders, "inventory")}>Previous products</Link>}
        <span>Page {products}</span>{productCount > products * 20 && <Link className="text-link" href={page(products + 1, orders, "inventory")}>Next products</Link>}</nav>}
    </section>
    <section id="orders"><h2>Demo orders</h2>{!recent.length && <p>No orders on this page.</p>}
      {recent.map((row) => <details className="admin-record" key={row.id}>
        <summary className="order-reference">{row.reference} · {row.status} · {money(row.totalCents)}</summary>
        <p>{row.createdAt.toISOString().slice(0, 10)} · {row.destination}</p>
        <ul>{row.items.map((item) => <li key={item.sku}>{item.quantity} × {item.title} · {item.sku}</li>)}</ul>
        {orderTransitions[row.status][0] && <AdvanceOrder id={row.id} next={orderTransitions[row.status][0]} />}
      </details>)}
      {(orders > 1 || orderCount > orders * 20) && <nav className="pagination" aria-label="Order administration pages">
        {orders > 1 && <Link className="text-link" href={page(products, orders - 1, "orders")}>Previous orders</Link>}
        <span>Page {orders}</span>{orderCount > orders * 20 && <Link className="text-link" href={page(products, orders + 1, "orders")}>Next orders</Link>}</nav>}
    </section>
  </main>;
}
