import math


class RouteAI_FareEngine:

    def __init__(self):

        # Base Fare Coefficients
        self.base_fares = {
            '2S': 0.25,
            'SL': 0.50,
            '3E': 1.15,
            '3A': 1.20,
            '2A': 1.80,
            '1A': 3.50
        }

        # Reservation Fees
        self.res_fee = {
            '2S': 15,
            'SL': 20,
            '3E': 40,
            '3A': 40,
            '2A': 50,
            '1A': 60
        }

        # Superfast Fees
        self.sf_fee = {
            '2S': 15,
            'SL': 30,
            '3E': 45,
            '3A': 45,
            '2A': 45,
            '1A': 75
        }

        # AC Classes
        self.ac_classes = ['3E', '3A', '2A', '1A']

    # =========================================
    # HAVERSINE DISTANCE
    # =========================================

    def calculate_haversine_distance(

        self,
        lat1,
        lon1,
        lat2,
        lon2
    ):

        R = 6371

        dlat = math.radians(lat2 - lat1)

        dlon = math.radians(lon2 - lon1)

        a = (

            math.sin(dlat / 2) ** 2

            +

            math.cos(math.radians(lat1))
            *
            math.cos(math.radians(lat2))
            *
            math.sin(dlon / 2) ** 2
        )

        c = 2 * math.atan2(
            math.sqrt(a),
            math.sqrt(1 - a)
        )

        return R * c

    # =========================================
    # TRAIN FARE CALCULATION
    # =========================================

    def get_fare(

        self,
        displacement_km,
        travel_class,
        train_category="Mail/Express"
    ):

        actual_track_dist = displacement_km * 1.3

        # =========================================
        # VALIDATION RULES
        # =========================================

        # Shatabdi / Vande Bharat Restrictions
        if train_category in ["Shatabdi", "Vande Bharat"]:

            if travel_class not in ['3A', '1A']:

                return {
                    "fare": None,
                    "message": "Class not available"
                }

        # Rajdhani Restriction
        if (

            train_category == "Rajdhani/Duronto"

            and

            travel_class == "SL"
        ):

            return {
                "fare": None,
                "message": "Class not available"
            }

        # =========================================
        # BASE FARE LOGIC
        # =========================================

        bf = self.base_fares.get(travel_class, 0)

        m_df = 1.0

        cc = 0

        # Rajdhani / Shatabdi
        if train_category in [

            "Rajdhani/Duronto",
            "Shatabdi"

        ]:

            if travel_class == '3A':

                bf = 1.30

            m_df = 1.2

            cc = 400 if actual_track_dist < 1750 else 800

        # Vande Bharat
        elif train_category == "Vande Bharat":

            if travel_class == '3A':

                bf = 2.0

            elif travel_class == '1A':

                bf = 4.0

            cc = 400

        # Long Distance Logic
        else:

            if actual_track_dist > 1500:

                if travel_class == '3A':

                    bf = 0.85

                elif travel_class == '2A':

                    bf = 1.10

                elif travel_class == 'SL':

                    bf = 0.40

        # =========================================
        # TOTAL BASE CALCULATION
        # =========================================

        total_base = (

            bf
            *
            actual_track_dist

        ) * m_df

        # =========================================
        # FEES
        # =========================================

        rf = self.res_fee.get(
            travel_class,
            0
        )

        sf = (

            self.sf_fee.get(
                travel_class,
                0
            )

            if train_category != "Mail/Express"

            else 0
        )

        # =========================================
        # GST
        # =========================================

        fare_before_gst = total_base + rf + sf

        gst = (

            fare_before_gst * 0.05

            if travel_class in self.ac_classes

            else 0
        )

        # =========================================
        # FINAL FARE
        # =========================================

        total_fare = (

            math.floor(
                fare_before_gst + gst
            )

            + cc
        )

        # =========================================
        # RETURN RESULT
        # =========================================

        return {

            "fare": total_fare,

            "distance_km": round(
                actual_track_dist,
                2
            ),

            "train_category": train_category,

            "class": travel_class
        }