import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import ProductForm from '../components/ProductForm';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = () => {
    fetch(`/api/products?search=${search}`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(() => toast.error('Failed to load products'));
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleOpenNew = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSave = async (data) => {
    const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to save');
      
      toast.success(editingProduct ? 'Product updated' : 'Product created');
      setIsFormOpen(false);
      fetchProducts();
    } catch (error) {
      toast.error(typeof error.message === 'string' ? error.message : 'Validation Error');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
      <Layout title="Products">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Product Catalog</h1>
            <p className="text-slate-400 dark:text-slate-400 mt-1">Manage inventory items and pricing</p>
          </div>
          <button onClick={handleOpenNew} className="btn-primary flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            Add Product
          </button>
        </div>

        <div className="card overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 bg-surface-elevated flex gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                className="input pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-surface-card text-xs uppercase text-slate-400 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold text-right">Price</th>
                  <th className="px-6 py-4 font-semibold text-right">Stock</th>
                  <th className="px-6 py-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-surface-elevated/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{product.name}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{product.barcode || 'No barcode'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge-blue capitalize">{product.category}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-emerald-400">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2.5 py-1 rounded-md font-bold text-xs ${
                        product.quantity <= product.lowStockThreshold 
                          ? 'bg-red-500/10 text-red-500' 
                          : 'bg-surface text-slate-700 dark:text-slate-300'
                      }`}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleOpenEdit(product)}
                          className="p-2 text-slate-400 dark:text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-slate-400 dark:text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <ProductForm 
          isOpen={isFormOpen}
          product={editingProduct}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSave}
        />
      </Layout>
    </ProtectedRoute>
  );
}
