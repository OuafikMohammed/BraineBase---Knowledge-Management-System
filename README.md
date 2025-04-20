# BrainBase - Knowledge Management System

## Table of Contents
1. [Business Rules (Règles de Gestion)](#business-rules)
2. [System Architecture](#system-architecture)
3. [Backend Structure (Laravel)](#backend-structure)
4. [Frontend Structure (Next.js)](#frontend-structure)
5. [Setup Instructions](#setup-instructions)
6. [API Documentation](#api-documentation)
7. [Testing](#testing)

## Business Rules (Règles de Gestion) <a name="business-rules"></a>

### 1. User Profile Management
- **RG-P1**: The system defines three types of user profiles: ADMIN, EDITOR, and VIEWER.
- **RG-P2**: Each user profile is identified by a unique identifier (idProfile).
- **RG-P3**: Mandatory attributes for a profile are: name, surname, email, and status.
- **RG-P4**: A user's email must be unique within the system.
- **RG-P5**: Users can switch between roles for testing purposes (implemented in the frontend).

### 2. Access Rights Management
- **RG-D1**: An ADMIN can perform all operations (create, modify, delete) on all entities.
- **RG-D2**: An EDITOR can view PDFs, download them, create collections, and propose adding PDFs.
- **RG-D3**: An EDITOR cannot modify or delete an existing PDF.
- **RG-D4**: A VIEWER can only view and download PDFs, and save them to their favorites collection.
- **RG-D5**: A VIEWER cannot create, modify, or delete collections (except their favorites collection).

### 3. PDF Management
- **RG-PDF1**: Each PDF is characterized by an identifier, title, description, date added, size, and category.
- **RG-PDF2**: PDFs can be added directly by users with EDITOR or ADMIN roles without requiring prior approval.
- **RG-PDF3**: A PDF can belong to one or more collections.
- **RG-PDF4**: PDFs can be searched and filtered by various attributes (implemented in the frontend).

### 4. Collection Management
- **RG-C1**: Each collection is characterized by an identifier, name, description, and number of PDFs.
- **RG-C2**: Each user has their own favorites collection that they can manage freely.
- **RG-C3**: Only ADMIN and EDITOR can create general collections.
- **RG-C4**: Only ADMIN can modify or delete general collections.
- **RG-C5**: A VIEWER can only save PDFs to their own favorites collection.

### 5. Notes Management (Vaults and Elements)
- **RG-N1**: Each user has their own note spaces (Vaults).
- **RG-N2**: A Vault contains elements that can be of type FOLDER or FILE.
- **RG-N3**: FOLDER type elements can contain other elements (FOLDER or FILE).
- **RG-N4**: FILE type elements contain textual content formatted in HTML.
- **RG-N5**: The hierarchical structure of elements is managed via a parent identifier system (parentId).
- **RG-N6**: Notes support rich text editing with formatting options (implemented in the frontend).
- **RG-N7**: Notes can be saved individually or globally to the database (implemented in the frontend).

### 6. Notification Management
- **RG-NOT1**: A notification is generated when a PDF is added by an EDITOR.
- **RG-NOT2**: Notifications are addressed to a specific recipient (idRecipient).
- **RG-NOT3**: A notification can be linked to a specific PDF (idPDF).
- **RG-NOT4**: Notifications can be of different types: VALIDATION_PDF, SYSTEM, OTHER.
- **RG-NOT5**: A notification has a read status (isRead).

### 7. Email Management
- **RG-E1**: The system can send emails to users.
- **RG-E2**: Each email is characterized by a title, subject, content, and send date.
- **RG-E3**: Emails are associated with a recipient user profile.

### 8. Analytics
- **RG-A1**: The system provides analytics on PDF usage, collections, and user engagement.
- **RG-A2**: Analytics data can be filtered by date range and other parameters.
- **RG-A3**: Analytics visualizations include charts, graphs, and heatmaps.
- **RG-A4**: Analytics data can be exported in various formats (CSV, PDF, etc.).

## System Architecture <a name="system-architecture"></a>

BrainBase uses a modern, decoupled architecture:

- **Frontend**: Next.js (React framework)
- **Backend**: Laravel PHP framework
- **Database**: PostgreSQL
- **Authentication**: Laravel Sanctum
- **File Storage**: Laravel Storage with S3 compatibility

## Backend Structure (Laravel) <a name="backend-structure"></a>

### Database Schema

![Class Diagram](https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Diagramme_classe-6NNt1KHc4iZw8YRHekLnO0Lt0Osbw2.png)

### Database Tables

#### Profile
- `id_profile` (UUID, PK)
- `nom` (string)
- `prenom` (string)
- `email` (string, unique)
- `profile_type` (enum: ADMIN, EDITOR, VIEWER)
- `profile_status` (enum: ACTIVE, INACTIVE, PENDING)
- `mobile_phone` (string)
- `job_title` (string)
- `date_creation` (timestamp)
- `date_modification` (timestamp)

#### PDF
- `id_pdf` (UUID, PK)
- `title` (string)
- `description` (string)
- `url_fichier` (string)
- `size` (integer)
- `pdf_category` (enum: TECHNICAL, BUSINESS, LEGAL, OTHER)
- `date_upload` (timestamp)
- `date_modification` (timestamp)
- `creator` (UUID, FK to Profile)
- `last_collection` (UUID, FK to Collection)

#### Collection
- `id_collection` (UUID, PK)
- `name` (string)
- `description` (string)
- `number_pdf` (integer)
- `collection_type` (enum: STANDARD, FAVORITE)
- `owner_profile` (UUID, FK to Profile)
- `date_creation` (timestamp)
- `date_modification` (timestamp)
- `owner` (UUID, FK to Profile)

#### Vault
- `id_vault` (UUID, PK)
- `name` (string)
- `description` (string)
- `id_profile` (UUID, FK to Profile)
- `date_creation` (timestamp)
- `date_modification` (timestamp)
- `owner` (UUID, FK to Profile)

#### Element
- `id_element` (UUID, PK)
- `name` (string)
- `element_type` (enum: FOLDER, FILE)
- `id_vault` (UUID, FK to Vault)
- `id_parent` (UUID, self-referencing FK)
- `content_html` (text)
- `position` (integer)
- `date_creation` (timestamp)
- `date_modification` (timestamp)
- `vault` (UUID, FK to Vault)

#### Email
- `id_email` (UUID, PK)
- `title` (string)
- `object` (string)
- `content` (text)
- `date_envoi` (timestamp)
- `is_sent` (boolean)
- `destinataire` (UUID, FK to Profile)

#### PDFCollection
- `id_pdf_collection` (UUID, PK)
- `pdf` (UUID, FK to PDF)
- `collection` (UUID, FK to Collection)
- `date_ajout` (timestamp)

#### CollectionShare
- `id_share` (UUID, PK)
- `id_collection` (UUID, FK to Collection)
- `id_profile` (UUID, FK to Profile)
- `share_permission` (enum: READ, WRITE)
- `date_partage` (timestamp)
- `collection` (UUID, FK to Collection)
- `profile` (UUID, FK to Profile)

### Laravel Models

#### Profile Model
\`\`\`php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Profile extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasUuids;

    protected $primaryKey = 'id_profile';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'profile_type',
        'profile_status',
        'mobile_phone',
        'job_title',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'date_creation' => 'datetime',
        'date_modification' => 'datetime',
    ];

    // Relationships
    public function pdfs()
    {
        return $this->hasMany(PDF::class, 'creator', 'id_profile');
    }

    public function collections()
    {
        return $this->hasMany(Collection::class, 'owner_profile', 'id_profile');
    }

    public function vaults()
    {
        return $this->hasMany(Vault::class, 'id_profile', 'id_profile');
    }

    public function sharedCollections()
    {
        return $this->belongsToMany(Collection::class, 'collection_shares', 'id_profile', 'id_collection')
            ->withPivot('share_permission')
            ->withTimestamps();
    }

    public function emails()
    {
        return $this->hasMany(Email::class, 'destinataire', 'id_profile');
    }

    // Get favorite collection
    public function favoriteCollection()
    {
        return $this->collections()->where('collection_type', 'FAVORITE')->first();
    }
}
\`\`\`

#### PDF Model
\`\`\`php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PDF extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'pdfs';
    protected $primaryKey = 'id_pdf';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'title',
        'description',
        'url_fichier',
        'size',
        'pdf_category',
        'creator',
    ];

    protected $casts = [
        'date_upload' => 'datetime',
        'date_modification' => 'datetime',
        'size' => 'integer',
    ];

    // Relationships
    public function createdBy()
    {
        return $this->belongsTo(Profile::class, 'creator', 'id_profile');
    }

    public function collections()
    {
        return $this->belongsToMany(Collection::class, 'pdf_collections', 'pdf', 'collection')
            ->withTimestamps(['date_ajout']);
    }

    public function lastCollection()
    {
        return $this->belongsTo(Collection::class, 'last_collection', 'id_collection');
    }

    // Scopes for filtering
    public function scopeByCategory($query, $category)
    {
        return $query->where('pdf_category', $category);
    }

    public function scopeSearch($query, $searchTerm)
    {
        return $query->where(function ($q) use ($searchTerm) {
            $q->where('title', 'LIKE', "%{$searchTerm}%")
              ->orWhere('description', 'LIKE', "%{$searchTerm}%");
        });
    }
}
\`\`\`

#### Collection Model
\`\`\`php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Collection extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'id_collection';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'description',
        'collection_type',
        'owner_profile',
    ];

    protected $casts = [
        'date_creation' => 'datetime',
        'date_modification' => 'datetime',
        'number_pdf' => 'integer',
    ];

    // Relationships
    public function owner()
    {
        return $this->belongsTo(Profile::class, 'owner_profile', 'id_profile');
    }

    public function pdfs()
    {
        return $this->belongsToMany(PDF::class, 'pdf_collections', 'collection', 'pdf')
            ->withTimestamps(['date_ajout']);
    }

    public function sharedWith()
    {
        return $this->belongsToMany(Profile::class, 'collection_shares', 'id_collection', 'id_profile')
            ->withPivot('share_permission')
            ->withTimestamps(['date_partage']);
    }

    // Update PDF count
    public function updatePdfCount()
    {
        $this->number_pdf = $this->pdfs()->count();
        $this->save();
    }
}
\`\`\`

#### Vault Model
\`\`\`php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Vault extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'id_vault';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'description',
        'id_profile',
    ];

    protected $casts = [
        'date_creation' => 'datetime',
        'date_modification' => 'datetime',
    ];

    // Relationships
    public function owner()
    {
        return $this->belongsTo(Profile::class, 'id_profile', 'id_profile');
    }

    public function elements()
    {
        return $this->hasMany(Element::class, 'id_vault', 'id_vault');
    }

    // Get root elements (no parent)
    public function rootElements()
    {
        return $this->elements()->whereNull('id_parent');
    }
}
\`\`\`

#### Element Model
\`\`\`php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Element extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'id_element';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'element_type',
        'id_vault',
        'id_parent',
        'content_html',
        'position',
    ];

    protected $casts = [
        'date_creation' => 'datetime',
        'date_modification' => 'datetime',
        'position' => 'integer',
    ];

    // Relationships
    public function vault()
    {
        return $this->belongsTo(Vault::class, 'id_vault', 'id_vault');
    }

    public function parent()
    {
        return $this->belongsTo(Element::class, 'id_parent', 'id_element');
    }

    public function children()
    {
        return $this->hasMany(Element::class, 'id_parent', 'id_element')->orderBy('position');
    }

    // Check if element is a folder
    public function isFolder()
    {
        return $this->element_type === 'FOLDER';
    }

    // Check if element is a file
    public function isFile()
    {
        return $this->element_type === 'FILE';
    }
}
\`\`\`

### Laravel Controllers

#### ProfileController
\`\`\`php
<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use App\Models\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function index()
    {
        return response()->json(Profile::all());
    }

    public function show($id)
    {
        $profile = Profile::findOrFail($id);
        return response()->json($profile);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:profiles',
            'password' => 'required|string|min:8',
            'profile_type' => ['required', Rule::in(['ADMIN', 'EDITOR', 'VIEWER'])],
            'profile_status' => ['required', Rule::in(['ACTIVE', 'INACTIVE', 'PENDING'])],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $profile = Profile::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'profile_type' => $request->profile_type,
            'profile_status' => $request->profile_status,
            'mobile_phone' => $request->mobile_phone,
            'job_title' => $request->job_title,
        ]);

        // Create favorite collection for the user
        Collection::create([
            'name' => 'Favorites',
            'description' => 'Your favorite PDFs',
            'collection_type' => 'FAVORITE',
            'owner_profile' => $profile->id_profile,
        ]);

        return response()->json($profile, 201);
    }

    public function update(Request $request, $id)
    {
        $profile = Profile::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nom' => 'string|max:255',
            'prenom' => 'string|max:255',
            'email' => [
                'string',
                'email',
                'max:255',
                Rule::unique('profiles')->ignore($profile->id_profile, 'id_profile'),
            ],
            'profile_type' => [Rule::in(['ADMIN', 'EDITOR', 'VIEWER'])],
            'profile_status' => [Rule::in(['ACTIVE', 'INACTIVE', 'PENDING'])],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $profile->update($request->all());

        return response()->json($profile);
    }

    public function destroy($id)
    {
        $profile = Profile::findOrFail($id);
        $profile->delete();

        return response()->json(null, 204);
    }
}
\`\`\`

#### PDFController
\`\`\`php
<?php

namespace App\Http\Controllers;

use App\Models\PDF;
use App\Models\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class PDFController extends Controller
{
    public function index(Request $request)
    {
        $query = PDF::query();

        // Apply filters
        if ($request->has('category')) {
            $query->byCategory($request->category);
        }

        if ($request->has('search')) {
            $query->search($request->search);
        }

        // Pagination
        $pdfs = $query->paginate($request->per_page ?? 10);

        return response()->json($pdfs);
    }

    public function show($id)
    {
        $pdf = PDF::with('createdBy', 'collections')->findOrFail($id);
        return response()->json($pdf);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'pdf_file' => 'required|file|mimes:pdf|max:10240', // 10MB max
            'pdf_category' => ['required', Rule::in(['TECHNICAL', 'BUSINESS', 'LEGAL', 'OTHER'])],
            'collection_id' => 'nullable|exists:collections,id_collection',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Store the file
        $path = $request->file('pdf_file')->store('pdfs', 'public');
        $size = $request->file('pdf_file')->getSize();

        // Create PDF record
        $pdf = PDF::create([
            'title' => $request->title,
            'description' => $request->description,
            'url_fichier' => $path,
            'size' => $size,
            'pdf_category' => $request->pdf_category,
            'creator' => auth()->id(),
        ]);

        // Add to collection if specified
        if ($request->has('collection_id')) {
            $collection = Collection::findOrFail($request->collection_id);
            $pdf->collections()->attach($collection->id_collection);
            $pdf->last_collection = $collection->id_collection;
            $pdf->save();
            
            // Update collection PDF count
            $collection->updatePdfCount();
        }

        return response()->json($pdf, 201);
    }

    public function update(Request $request, $id)
    {
        $pdf = PDF::findOrFail($id);

        // Check if user has permission to update
        if (auth()->user()->profile_type === 'VIEWER' || 
            (auth()->user()->profile_type === 'EDITOR' && $pdf->creator !== auth()->id())) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'string|max:255',
            'description' => 'nullable|string',
            'pdf_category' => [Rule::in(['TECHNICAL', 'BUSINESS', 'LEGAL', 'OTHER'])],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $pdf->update($request->only(['title', 'description', 'pdf_category']));

        return response()->json($pdf);
    }

    public function destroy($id)
    {
        $pdf = PDF::findOrFail($id);

        // Check if user has permission to delete
        if (auth()->user()->profile_type !== 'ADMIN') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Delete the file
        if (Storage::disk('public')->exists($pdf->url_fichier)) {
            Storage::disk('public')->delete($pdf->url_fichier);
        }

        // Delete from collections
        $pdf->collections()->detach();

        // Delete the record
        $pdf->delete();

        return response()->json(null, 204);
    }

    public function download($id)
    {
        $pdf = PDF::findOrFail($id);
        
        if (!Storage::disk('public')->exists($pdf->url_fichier)) {
            return response()->json(['error' => 'File not found'], 404);
        }

        return Storage::disk('public')->download($pdf->url_fichier, $pdf->title . '.pdf');
    }

    public function addToCollection(Request $request, $id)
    {
        $pdf = PDF::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'collection_id' => 'required|exists:collections,id_collection',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $collection = Collection::findOrFail($request->collection_id);
        
        // Check if user has permission to add to this collection
        $canAdd = false;
        
        if (auth()->user()->profile_type === 'ADMIN') {
            $canAdd = true;
        } else if (auth()->user()->profile_type === 'EDITOR') {
            $canAdd = $collection->owner_profile === auth()->id() || 
                      $collection->sharedWith()->where('id_profile', auth()->id())
                                ->where('share_permission', 'WRITE')
                                ->exists();
        } else if (auth()->user()->profile_type === 'VIEWER') {
            $canAdd = $collection->collection_type === 'FAVORITE' && 
                      $collection->owner_profile === auth()->id();
        }
        
        if (!$canAdd) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        // Add to collection if not already there
        if (!$pdf->collections()->where('id_collection', $collection->id_collection)->exists()) {
            $pdf->collections()->attach($collection->id_collection);
            $pdf->last_collection = $collection->id_collection;
            $pdf->save();
            
            // Update collection PDF count
            $collection->updatePdfCount();
        }
        
        return response()->json(['message' => 'PDF added to collection']);
    }
}
\`\`\`

### Laravel Migrations

#### Create Profiles Table
\`\`\`php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('profiles', function (Blueprint $table) {
            $table->uuid('id_profile')->primary();
            $table->string('nom');
            $table->string('prenom');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('profile_type', ['ADMIN', 'EDITOR', 'VIEWER']);
            $table->enum('profile_status', ['ACTIVE', 'INACTIVE', 'PENDING']);
            $table->string('mobile_phone')->nullable();
            $table->string('job_title')->nullable();
            $table->rememberToken();
            $table->timestamp('date_creation')->useCurrent();
            $table->timestamp('date_modification')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down()
    {
        Schema::dropIfExists('profiles');
    }
};
\`\`\`

#### Create PDFs Table
\`\`\`php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('pdfs', function (Blueprint $table) {
            $table->uuid('id_pdf')->primary();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('url_fichier');
            $table->unsignedBigInteger('size');
            $table->enum('pdf_category', ['TECHNICAL', 'BUSINESS', 'LEGAL', 'OTHER']);
            $table->uuid('creator');
            $table->uuid('last_collection')->nullable();
            $table->timestamp('date_upload')->useCurrent();
            $table->timestamp('date_modification')->useCurrent()->useCurrentOnUpdate();
            
            $table->foreign('creator')->references('id_profile')->on('profiles');
            $table->foreign('last_collection')->references('id_collection')->on('collections')->nullOnDelete();
        });
    }

    public function down()
    {
        Schema::dropIfExists('pdfs');
    }
};
\`\`\`

### API Routes
\`\`\`php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PDFController;
use App\Http\Controllers\CollectionController;
use App\Http\Controllers\VaultController;
use App\Http\Controllers\ElementController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AnalyticsController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Profile routes
    Route::apiResource('profiles', ProfileController::class);
    
    // PDF routes
    Route::apiResource('pdfs', PDFController::class);
    Route::get('/pdfs/{id}/download', [PDFController::class, 'download']);
    Route::post('/pdfs/{id}/add-to-collection', [PDFController::class, 'addToCollection']);
    
    // Collection routes
    Route::apiResource('collections', CollectionController::class);
    Route::get('/collections/{id}/pdfs', [CollectionController::class, 'getPdfs']);
    Route::post('/collections/{id}/share', [CollectionController::class, 'shareCollection']);
    Route::delete('/collections/{id}/unshare/{profileId}', [CollectionController::class, 'unshareCollection']);
    
    // Vault routes
    Route::apiResource('vaults', VaultController::class);
    Route::get('/vaults/{id}/elements', [VaultController::class, 'getElements']);
    
    // Element routes
    Route::apiResource('elements', ElementController::class);
    Route::get('/elements/{id}/children', [ElementController::class, 'getChildren']);
    Route::post('/elements/{id}/move', [ElementController::class, 'moveElement']);
    
    // Analytics routes
    Route::get('/analytics/pdf-activity', [AnalyticsController::class, 'pdfActivity']);
    Route::get('/analytics/collection-insights', [AnalyticsController::class, 'collectionInsights']);
    Route::get('/analytics/user-engagement', [AnalyticsController::class, 'userEngagement']);
    Route::get('/analytics/collaboration-metrics', [AnalyticsController::class, 'collaborationMetrics']);
    Route::get('/analytics/word-cloud', [AnalyticsController::class, 'wordCloud']);
});
\`\`\`

### Laravel Authentication with Sanctum

#### AuthController
\`\`\`php
<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use App\Models\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:profiles',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422
