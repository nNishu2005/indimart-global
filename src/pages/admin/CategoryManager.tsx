import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import * as Icons from 'lucide-react';
import { Trash2, Plus, FolderTree, Upload, Package } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Curated agriculture-friendly Lucide icons
const ICON_CHOICES = [
  'Wheat', 'Sprout', 'Leaf', 'Carrot', 'Apple', 'Cherry', 'Grape', 'Banana',
  'Flame', 'Milk', 'Droplet', 'Coffee', 'FlaskConical', 'Tractor', 'Bird',
  'Egg', 'Fish', 'Beef', 'TreePine', 'TreeDeciduous', 'Sun', 'CloudRain',
  'Truck', 'Package', 'ShoppingBasket', 'Warehouse',
];

const CategoryManager = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug, description, icon, image_url')
      .order('name');
    setCategories(data || []);
  };

  useEffect(() => { load(); }, []);

  const uploadImage = async (categoryId: string, file: File) => {
    const ext = file.name.split('.').pop();
    const path = `${categoryId}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('category-images').upload(path, file, {
      upsert: true, cacheControl: '3600',
    });
    if (error) throw error;
    const { data } = supabase.storage.from('category-images').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const { data: inserted, error } = await supabase.from('categories').insert({
        name: name.trim(),
        slug: slugify(name),
        description: description.trim() || null,
        icon: icon || null,
      }).select('id').single();
      if (error) throw error;

      if (imageFile && inserted) {
        const url = await uploadImage(inserted.id, imageFile);
        await supabase.from('categories').update({ image_url: url }).eq('id', inserted.id);
      }

      toast({ title: 'Category added' });
      setName(''); setDescription(''); setIcon(''); setImageFile(null);
      load();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Category deleted' });
    load();
  };

  const handleReplaceImage = async (cat: Category, file: File) => {
    try {
      const url = await uploadImage(cat.id, file);
      const { error } = await supabase.from('categories').update({ image_url: url }).eq('id', cat.id);
      if (error) throw error;
      toast({ title: 'Image updated' });
      load();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const renderThumb = (cat: Category) => {
    if (cat.image_url) {
      return <img src={cat.image_url} alt={cat.name} className="h-12 w-12 rounded object-cover" />;
    }
    const IconComp = (cat.icon && (Icons as any)[cat.icon]) || Package;
    return (
      <div className="h-12 w-12 rounded bg-secondary/10 flex items-center justify-center">
        <IconComp className="h-6 w-6 text-secondary" />
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <FolderTree className="h-7 w-7" /> Manage Categories
          </h1>
          <p className="text-muted-foreground">Add icons or upload images shown on the Categories page</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" /> Add New Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Organic Vegetables" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Description</Label>
                  <Textarea id="desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon</Label>
                  <select
                    id="icon"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">— None —</option>
                    {ICON_CHOICES.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  {icon && (() => {
                    const I = (Icons as any)[icon] || Package;
                    return (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        Preview: <I className="h-5 w-5 text-secondary" />
                      </div>
                    );
                  })()}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Image (optional, overrides icon)</Label>
                  <Input id="image" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                </div>
                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? 'Saving...' : 'Add Category'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing Categories ({categories.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <p className="text-sm text-muted-foreground">No categories yet.</p>
              ) : (
                <ul className="space-y-2 max-h-[600px] overflow-y-auto">
                  {categories.map((c) => (
                    <li key={c.id} className="flex items-center justify-between border rounded-md p-3 gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {renderThumb(c)}
                        <div className="min-w-0">
                          <p className="font-medium truncate">{c.name}</p>
                          {c.description && <p className="text-xs text-muted-foreground truncate">{c.description}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleReplaceImage(c, e.target.files[0])}
                          />
                          <span className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-muted">
                            <Upload className="h-4 w-4" />
                          </span>
                        </label>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CategoryManager;
