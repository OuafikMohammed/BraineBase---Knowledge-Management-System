'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collectionService } from '@/lib/collection-service';
import { useToast } from '@/hooks/use-toast';
import CollectionForm from '@/components/pdfs/CollectionForm';

export default function EditCollectionPage() {
    const [collection, setCollection] = useState(null);
    const [loading, setLoading] = useState(true);
    const params = useParams();
    const collectionId = params.collectionId;
    const { toast } = useToast();

    useEffect(() => {
        loadCollection();
    }, [collectionId]);

    const loadCollection = async () => {
        try {
            const data = await collectionService.getCollection(collectionId);
            setCollection(data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load collection",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!collection) return <div>Collection not found</div>;

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Edit Collection</h1>
            <CollectionForm collection={collection} />
        </div>
    );
}