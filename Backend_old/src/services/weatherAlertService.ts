import weatherService from './weatherService';
import { WeatherAlertModel } from '../models/WeatherAlert';
import { UserModel } from '../models/User';

export class WeatherAlertService {
  /**
   * Check weather and create alerts for users
   * This should be called periodically (e.g., via cron job)
   */
  static async checkAndCreateAlerts(): Promise<void> {
    try {
      // Get all farmers with location data
      const users = await UserModel.findByRole('farmer');
      
      for (const user of users) {
        if (!user.location) continue;

        try {
          // Get user's location coordinates (simplified - in production, use geocoding)
          // For now, we'll use a default location or skip if no coordinates
          const latitude = 11.0168; // Default Coimbatore coordinates
          const longitude = 76.9558;

          // Get weather data
          const weatherData = await weatherService.getWeatherData(latitude, longitude);
          
          // Detect climate alerts
          const alerts = weatherService.detectClimateAlerts(weatherData);

          // Create weather alerts for critical/high severity alerts
          for (const alert of alerts) {
            if (alert.severity === 'critical' || alert.severity === 'high') {
              // Check if similar alert already exists (avoid duplicates)
              const existingAlerts = await WeatherAlertModel.findByUserId(user.id, true);
              const similarAlert = existingAlerts.find(
                a => a.alert_type === alert.type && 
                     a.severity === alert.severity &&
                     new Date(a.alert_date).toDateString() === new Date().toDateString()
              );

              if (!similarAlert) {
                await WeatherAlertModel.create({
                  user_id: user.id,
                  alert_type: this.mapAlertType(alert.type),
                  severity: alert.severity,
                  title: this.getAlertTitle(alert.type, alert.severity),
                  message: alert.message,
                  recommendation: alert.recommendation,
                  location: user.location,
                  alert_date: new Date(),
                }).catch((err) => {
                  console.error(`Failed to create alert for user ${user.id}:`, err);
                });
              }
            }
          }
        } catch (error) {
          console.error(`Error checking weather for user ${user.id}:`, error);
          // Continue with next user
        }
      }
    } catch (error) {
      console.error('Error in weather alert service:', error);
    }
  }

  private static mapAlertType(type: string): 'frost' | 'drought' | 'heavy_rain' | 'storm' | 'extreme_heat' | 'flood' | 'other' {
    const mapping: Record<string, 'frost' | 'drought' | 'heavy_rain' | 'storm' | 'extreme_heat' | 'flood' | 'other'> = {
      'high_temperature': 'extreme_heat',
      'heavy_rainfall': 'heavy_rain',
      'drought': 'drought',
      'storm': 'storm',
      'extreme_wind': 'storm',
      'fungal_growth': 'other',
    };
    return mapping[type] || 'other';
  }

  private static getAlertTitle(type: string, severity: string): string {
    const titles: Record<string, string> = {
      'high_temperature': 'Extreme Heat Warning',
      'heavy_rainfall': 'Heavy Rainfall Alert',
      'drought': 'Drought Conditions',
      'storm': 'Storm Warning',
      'extreme_wind': 'High Wind Warning',
      'fungal_growth': 'Fungal Growth Risk',
    };
    return titles[type] || 'Weather Alert';
  }
}
