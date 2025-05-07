'use client';

export default function PdfList({ id }) {
    const [pdfs, setPdfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (id) {
            loadPdfs();
        }
    }, [id]);

    const loadPdfs = async () => {
        try {
            const data = await collectionService.getCollectionPdfs(id);
            setPdfs(data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load PDFs",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

}