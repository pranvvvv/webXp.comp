/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import {
  ArrowDown,
  ArrowRight,
  Baseline,
  ChevronDown,
  Film,
  Image,
  KeyRound,
  Layers,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  Tv,
  X,
  Briefcase,
  Utensils,
  Dumbbell,
  Stethoscope,
  GraduationCap,
  ShoppingBag,
  User
} from 'lucide-react';

const defaultProps = {
  strokeWidth: 2,
};

export const KeyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <KeyRound {...defaultProps} {...props} />
);

export const ArrowPathIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <RefreshCw {...defaultProps} {...props} />;

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Sparkles {...defaultProps} {...props} />
);

export const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Plus {...defaultProps} {...props} />
);

export const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <ChevronDown {...defaultProps} {...props} />;

export const SlidersHorizontalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <SlidersHorizontal {...defaultProps} {...props} />;

export const ArrowRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <ArrowRight {...defaultProps} {...props} />;

export const RectangleStackIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <Layers {...defaultProps} {...props} />;

export const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <X {...defaultProps} {...props} />
);

export const TextModeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Baseline {...defaultProps} {...props} />
);

export const FramesModeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <Image {...defaultProps} {...props} />;

export const ReferencesModeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <Film {...defaultProps} {...props} />;

export const TvIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Tv {...defaultProps} {...props} />
);

export const FilmIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Film {...defaultProps} {...props} />
);

export const BriefcaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Briefcase {...defaultProps} {...props} />
);

export const UtensilsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Utensils {...defaultProps} {...props} />
);

export const DumbbellIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Dumbbell {...defaultProps} {...props} />
);

export const StethoscopeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Stethoscope {...defaultProps} {...props} />
);

export const GraduationCapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <GraduationCap {...defaultProps} {...props} />
);

export const ShoppingBagIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <ShoppingBag {...defaultProps} {...props} />
);

export const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <User {...defaultProps} {...props} />
);

export const CurvedArrowDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props,
) => <ArrowDown {...props} strokeWidth={3} />;