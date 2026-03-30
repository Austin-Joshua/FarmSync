import { pool } from '../config/database';
import { query, queryOne, execute } from '../utils/dbHelper';

export interface DiseaseScan {
  id: string;
  user_id: string;
  crop_name: string;
  disease_name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  latitude: number;
  longitude: number;
  location_name?: string;
  image_url?: string;
  notes?: string;
  scanned_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDiseaseScanData {
  user_id: string;
  crop_name: string;
  disease_name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence?: number;
  latitude: number;
  longitude: number;
  location_name?: string;
  image_url?: string;
  notes?: string;
}

export class DiseaseScanModel {
  static async create(data: CreateDiseaseScanData): Promise<DiseaseScan> {
    await execute(
      pool,
      `INSERT INTO disease_scans (user_id, crop_name, disease_name, severity, confidence, latitude, longitude, location_name, image_url, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.user_id,
        data.crop_name,
        data.disease_name,
        data.severity,
        data.confidence || 0,
        data.latitude,
        data.longitude,
        data.location_name || null,
        data.image_url || null,
        data.notes || null,
      ]
    );

    // Fetch created scan (MySQL doesn't support RETURNING)
    const scan = await queryOne<DiseaseScan>(
      pool,
      'SELECT * FROM disease_scans WHERE user_id = ? AND latitude = ? AND longitude = ? ORDER BY created_at DESC LIMIT 1',
      [data.user_id, data.latitude, data.longitude]
    );
    if (!scan) throw new Error('Failed to create disease scan');
    return scan;
  }

  static async findById(id: string): Promise<DiseaseScan | null> {
    return queryOne<DiseaseScan>(pool, 'SELECT * FROM disease_scans WHERE id = ?', [id]);
  }

  static async findByUserId(userId: string, limit: number = 50): Promise<DiseaseScan[]> {
    return query<DiseaseScan>(
      pool,
      'SELECT * FROM disease_scans WHERE user_id = ? ORDER BY scanned_at DESC LIMIT ?',
      [userId, limit]
    );
  }

  static async getHeatmapData(
    minLat?: number,
    maxLat?: number,
    minLon?: number,
    maxLon?: number,
    days?: number
  ): Promise<Array<{ latitude: number; longitude: number; disease_name: string; severity: string; count: number }>> {
    let sql = `
      SELECT 
        latitude,
        longitude,
        disease_name,
        severity,
        COUNT(*) as count
      FROM disease_scans
      WHERE 1=1
    `;
    const params: any[] = [];

    if (minLat !== undefined) {
      sql += ' AND latitude >= ?';
      params.push(minLat);
    }
    if (maxLat !== undefined) {
      sql += ' AND latitude <= ?';
      params.push(maxLat);
    }
    if (minLon !== undefined) {
      sql += ' AND longitude >= ?';
      params.push(minLon);
    }
    if (maxLon !== undefined) {
      sql += ' AND longitude <= ?';
      params.push(maxLon);
    }
    if (days !== undefined) {
      sql += ' AND scanned_at >= DATE_SUB(NOW(), INTERVAL ? DAY)';
      params.push(days);
    }

    sql += ' GROUP BY latitude, longitude, disease_name, severity ORDER BY scanned_at DESC';

    return query(pool, sql, params);
  }

  static async getDiseaseStats(days: number = 30): Promise<
    Array<{
      disease_name: string;
      crop_name: string;
      severity: string;
      count: number;
      avg_latitude: number;
      avg_longitude: number;
    }>
  > {
    return query(
      pool,
      `SELECT 
        disease_name,
        crop_name,
        severity,
        COUNT(*) as count,
        AVG(latitude) as avg_latitude,
        AVG(longitude) as avg_longitude
      FROM disease_scans
      WHERE scanned_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY disease_name, crop_name, severity
      ORDER BY count DESC`,
      [days]
    );
  }
}
