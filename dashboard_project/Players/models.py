from django.db import models

class Player(models.Model):
    player_id = models.CharField(max_length=20)
    player_name = models.CharField(max_length=100)
    player_display_name = models.CharField(max_length=100)
    position = models.CharField(max_length=10)
    headshot_url = models.URLField(null=True, blank=True)
    season = models.IntegerField()
    team = models.CharField(max_length=10, null=True, blank=True)

    # Passing
    completions = models.IntegerField(default=0)
    attempts = models.IntegerField(default=0)
    passing_yards = models.FloatField(default=0)
    passing_tds = models.IntegerField(default=0)
    passing_interceptions = models.IntegerField(default=0)
    sacks_suffered = models.IntegerField(default=0)
    sack_yards_lost = models.FloatField(default=0)
    passing_2pt_conversions = models.IntegerField(default=0)
    passing_epa = models.FloatField(null=True, blank=True)
    passing_cpoe = models.FloatField(null=True, blank=True)
    pacr = models.FloatField(null=True, blank=True)

    # Rushing
    carries = models.IntegerField(default=0)
    rushing_yards = models.FloatField(default=0)
    rushing_tds = models.IntegerField(default=0)
    rushing_fumbles = models.IntegerField(default=0)

    # Misc
    fantasy_points = models.FloatField(default=0)
    games_played = models.IntegerField(default=0)

    class Meta:
        unique_together = ('player_id', 'season')

    def __str__(self):
        return f"{self.player_display_name} ({self.season})"
    
class RunningBacks(models.Model):
    player_id = models.CharField(max_length=20)
    player_name = models.CharField(max_length=100)
    player_display_name = models.CharField(max_length=100)
    position = models.CharField(max_length=10)
    headshot_url = models.URLField(null=True, blank=True)
    season = models.IntegerField()
    team = models.CharField(max_length=10, null=True, blank=True)

    # Rushing
    carries = models.IntegerField(default=0)
    rushing_yards = models.FloatField(default=0)
    rushing_tds = models.IntegerField(default=0)
    rushing_fumbles = models.IntegerField(default=0)
    rushing_fumbles_lost = models.IntegerField(default=0)
    rushing_first_downs = models.IntegerField(default=0)
    rushing_epa = models.FloatField(null=True, blank=True)

    # Receiving
    receptions = models.IntegerField(default=0)
    targets = models.IntegerField(default=0)
    receiving_yards = models.FloatField(default=0)
    receiving_tds = models.IntegerField(default=0)
    receiving_fumbles = models.IntegerField(default=0)
    receiving_fumbles_lost = models.IntegerField(default=0)
    receiving_air_yards = models.FloatField(default=0)
    receiving_yards_after_catch = models.FloatField(default=0)
    receiving_first_downs = models.IntegerField(default=0)
    receiving_2pt_conversions = models.IntegerField(default=0)
    receiving_epa = models.FloatField(null=True, blank=True)

    # Efficiency
    target_share = models.FloatField(null=True, blank=True)
    air_yards_share = models.FloatField(null=True, blank=True)
    racr = models.FloatField(null=True, blank=True)
    wopr = models.FloatField(null=True, blank=True)

    # Misc
    fantasy_points = models.FloatField(default=0)
    games_played = models.IntegerField(default=0)

    class Meta:
        unique_together = ('player_id', 'season')

    def __str__(self):
        return f"{self.player_display_name} ({self.season})"
    
    
class WideReceivers(models.Model):
    player_id = models.CharField(max_length=20)
    player_name = models.CharField(max_length=100)
    player_display_name = models.CharField(max_length=100)
    position = models.CharField(max_length=10)
    headshot_url = models.URLField(null=True, blank=True)
    season = models.IntegerField()
    team = models.CharField(max_length=10, null=True, blank=True)

    # Receiving
    receptions = models.IntegerField(default=0)
    targets = models.IntegerField(default=0)
    receiving_yards = models.FloatField(default=0)
    receiving_tds = models.IntegerField(default=0)
    receiving_fumbles = models.IntegerField(default=0)
    receiving_fumbles_lost = models.IntegerField(default=0)
    receiving_air_yards = models.FloatField(default=0)
    receiving_yards_after_catch = models.FloatField(default=0)
    receiving_first_downs = models.IntegerField(default=0)
    receiving_2pt_conversions = models.IntegerField(default=0)
    receiving_epa = models.FloatField(null=True, blank=True)

    # Efficiency
    target_share = models.FloatField(null=True, blank=True)
    air_yards_share = models.FloatField(null=True, blank=True)
    racr = models.FloatField(null=True, blank=True)
    wopr = models.FloatField(null=True, blank=True)

    # Misc
    fantasy_points = models.FloatField(default=0)
    games_played = models.IntegerField(default=0)

    class Meta:
        unique_together = ('player_id', 'season')

    def __str__(self):
        return f"{self.player_display_name} ({self.season})"
    
class TightEnd(models.Model):
    player_id = models.CharField(max_length=20)
    player_name = models.CharField(max_length=100)
    player_display_name = models.CharField(max_length=100)
    position = models.CharField(max_length=10)
    headshot_url = models.URLField(null=True, blank=True)
    season = models.IntegerField()
    team = models.CharField(max_length=10, null=True, blank=True)

    # Receiving
    receptions = models.IntegerField(default=0)
    targets = models.IntegerField(default=0)
    receiving_yards = models.FloatField(default=0)
    receiving_tds = models.IntegerField(default=0)
    receiving_fumbles = models.IntegerField(default=0)
    receiving_fumbles_lost = models.IntegerField(default=0)
    receiving_air_yards = models.FloatField(default=0)
    receiving_yards_after_catch = models.FloatField(default=0)
    receiving_first_downs = models.IntegerField(default=0)
    receiving_2pt_conversions = models.IntegerField(default=0)
    receiving_epa = models.FloatField(null=True, blank=True)

    # Efficiency
    target_share = models.FloatField(null=True, blank=True)
    air_yards_share = models.FloatField(null=True, blank=True)
    racr = models.FloatField(null=True, blank=True)
    wopr = models.FloatField(null=True, blank=True)

    # Misc
    fantasy_points = models.FloatField(default=0)
    games_played = models.IntegerField(default=0)

    class Meta:
        unique_together = ('player_id', 'season')

    def __str__(self):
        return f"{self.player_display_name} ({self.season})"
    
class Kicker(models.Model):
    player_id = models.CharField(max_length=20)
    player_name = models.CharField(max_length=100)
    player_display_name = models.CharField(max_length=100)
    position = models.CharField(max_length=10)
    headshot_url = models.URLField(null=True, blank=True)
    season = models.IntegerField()
    team = models.CharField(max_length=10, null=True, blank=True)

    # Field Goals 
 
    fg_made = models.IntegerField(default=0)
    fg_att = models.IntegerField(default=0)
    fg_missed = models.IntegerField(default=0)
    fg_blocked = models.IntegerField(default=0)
    fg_long = models.IntegerField(default=0)

    #PATs 

    '''
     # PAT stats
    pl.col('pat_made').sum(),
    pl.col('pat_att').sum(),
    pl.col('pat_missed').sum(),
    pl.col('pat_blocked').sum(),
    '''
    pat_made = models.IntegerField(default=0)
    pat_att = models.IntegerField(default=0)
    pat_missed = models.IntegerField(default=0)
    pat_blocked = models.IntegerField(default=0)

    '''
    # Game-winning FGs
    pl.col('gwfg_made').sum(),
    pl.col('gwfg_missed').sum(),
    pl.col('gwfg_distance').max(),      # longest GWFG attempt
    '''

    # Efficiency
    gwfg_made = models.IntegerField(default=0)
    gwfg_distance = models.IntegerField(default=0)


    # Misc
    fantasy_points = models.FloatField(default=0)
    games_played = models.IntegerField(default=0)

    class Meta:
        unique_together = ('player_id', 'season')

    def __str__(self):
        return f"{self.player_display_name} ({self.season})"