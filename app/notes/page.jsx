'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { vaultService } from '@/lib/vault-service';
import { FolderPlus, File, Folder, Plus, Trash, MoreVertical, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import AuthGuard from '@/components/auth/auth-guard';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function NotesPage() {
  const [vaults, setVaults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newVaultName, setNewVaultName] = useState('');
  const [newVaultDescription, setNewVaultDescription] = useState('');
  const [isCreatingVault, setIsCreatingVault] = useState(false);
  const [isEditingVault, setIsEditingVault] = useState(false);
  const [editingVault, setEditingVault] = useState(null);
  const [updatedVaultName, setUpdatedVaultName] = useState('');
  const [updatedVaultDescription, setUpdatedVaultDescription] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }

    if (!token || !userId) {
      router.push('/');
      return;
    }

    setIsLoggedIn(true);
    setUser({ id: userId });
    loadVaults();
  }, []);

  const loadVaults = async () => {
    try {
      setIsLoading(true);
      const data = await vaultService.getAllVaults();
      setVaults(data);
    } catch (error) {
      console.error('Error loading vaults:', error);
      toast({
        title: 'Error',
        description: 'Failed to load vaults',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateVault = async () => {
    if (!newVaultName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a vault name',
        variant: 'destructive',
      });
      return;
    }
    try {
      const newVault = await vaultService.createVault({
        name: newVaultName.trim(),
        description: newVaultDescription.trim(),
      });
      setVaults([...vaults, newVault]);
      setNewVaultName('');
      setNewVaultDescription('');
      setIsCreatingVault(false);
      toast({
        title: 'Success',
        description: 'Vault created successfully',
      });
      // Navigate to the newly created vault
      router.push(`/notes/${newVault.id_vault}`);
    } catch (error) {
      console.error('Error creating vault:', error);
      toast({
        title: 'Error',
        description: 'Failed to create vault',
        variant: 'destructive',
      });
    }
  };

  const handleEditVault = async () => {
    if (!updatedVaultName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a vault name",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedVault = await vaultService.updateVault(editingVault.id_vault, {
        name: updatedVaultName.trim(),
        description: updatedVaultDescription.trim(),
      });

      setVaults(vaults.map(vault => 
        vault.id_vault === editingVault.id_vault ? updatedVault : vault
      ));

      setIsEditingVault(false);
      setEditingVault(null);
      toast({
        title: "Success",
        description: "Vault updated successfully",
      });
    } catch (error) {
      console.error('Error updating vault:', error);
      toast({
        title: "Error",
        description: "Failed to update vault",
        variant: "destructive",
      });
    }
  };

  const handleDeleteVault = async (vault) => {
    if (!window.confirm(`Are you sure you want to delete "${vault.name}"? This action cannot be undone and will delete all notes inside the vault.`)) {
      return;
    }

    try {
      await vaultService.deleteVault(vault.id_vault);
      setVaults(vaults.filter(v => v.id_vault !== vault.id_vault));
      toast({
        title: "Success",
        description: "Vault deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting vault:', error);
      toast({
        title: "Error",
        description: "Failed to delete vault",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navbar
          isLoggedIn={isLoggedIn}
          user={user}
          onLogout={() => router.push('/')}
          theme={theme}
          toggleTheme={() => {
            const newTheme = theme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
            localStorage.setItem('theme', newTheme);
            document.documentElement.classList.toggle('dark', newTheme === 'dark');
          }}
        />
        <main className="container mx-auto py-10 px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Vaults</h1>
              <p className="text-muted-foreground mt-1">
                Organize your notes and documents
              </p>
            </div>
            <Dialog open={isCreatingVault} onOpenChange={setIsCreatingVault}>
              <DialogTrigger asChild>
                <Button>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  New Vault
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Vault</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newVaultName}
                      onChange={(e) => setNewVaultName(e.target.value)}
                      placeholder="Enter vault name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newVaultDescription}
                      onChange={(e) => setNewVaultDescription(e.target.value)}
                      placeholder="Enter vault description (optional)"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreatingVault(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateVault}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : vaults.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No vaults yet</h3>
              <p className="text-muted-foreground mt-1">Create your first vault to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vaults.map((vault) => (
                <Card
                  key={vault.id_vault}
                  className="relative group cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <Folder className="h-5 w-5" />
                          {vault.name}
                        </CardTitle>
                        <CardDescription>{vault.description}</CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setEditingVault(vault);
                            setUpdatedVaultName(vault.name);
                            setUpdatedVaultDescription(vault.description || '');
                            setIsEditingVault(true);
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteVault(vault)}
                            className="text-destructive"
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {vault.elements?.length || 0} items
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => router.push(`/notes/${vault.id_vault}`)}>
                      Open Vault
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* Edit Vault Dialog */}
          <Dialog open={isEditingVault} onOpenChange={setIsEditingVault}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Vault</DialogTitle>
                <DialogDescription>
                  Make changes to your vault.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={updatedVaultName}
                    onChange={(e) => setUpdatedVaultName(e.target.value)}
                    placeholder="Vault name"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input
                    id="description"
                    value={updatedVaultDescription}
                    onChange={(e) => setUpdatedVaultDescription(e.target.value)}
                    placeholder="Vault description"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditingVault(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditVault}>
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
