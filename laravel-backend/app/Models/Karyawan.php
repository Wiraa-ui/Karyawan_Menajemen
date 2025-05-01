<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject; // Import JWTSubject

class Karyawan extends Authenticatable implements JWTSubject // Implement JWTSubject
{
    use Notifiable;

    protected $fillable = [
        "nama",
        "email", 
        "username",
        "password",
        "unit_id",
        "tanggal_bergabung",
    ];

    protected $hidden = [
        "password",
    ];

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function jabatans()
    {
        return $this->belongsToMany(Jabatan::class, "jabatan_karyawan", "karyawan_id", "jabatan_id");
    }

    public function logins()
    {
        return $this->hasMany(Login::class);
    }

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [];
    }
}

